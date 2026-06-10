import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

// Hàm định dạng rút gọn tiền tệ cho trục Y (Ví dụ: 10,000,000 -> 10M)
const formatYAxis = (value) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
    return value;
};

const Dashboard = () => {
    const [wallets, setWallets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [chartView, setChartView] = useState('month'); 
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const availableYears = useMemo(() => {
        const startYear = 2000;
        const endYear = 2028;
        const yearsSet = new Set();
        
        for (let y = startYear; y <= endYear; y++) yearsSet.add(y);
        transactions.forEach(t => {
            const y = new Date(t.transaction_date).getFullYear();
            if (y) yearsSet.add(y);
        });
        
        return Array.from(yearsSet).sort((a, b) => b - a);
    }, [transactions]);

    useEffect(() => {
        if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
            setSelectedYear(availableYears[0]);
        }
    }, [availableYears, selectedYear]);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletsRes, transRes] = await Promise.all([
                    api.get('/wallets'),
                    api.get('/transactions')
                ]);
                setWallets(walletsRes.data);
                setTransactions(transRes.data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu", error);
            }
        };
        fetchData();
    }, []);

    const totalBalance = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.balance), 0);
    const recentTransactions = transactions.slice(0, 5);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyIncome = transactions
        .filter(t => t.type === 'income' && new Date(t.transaction_date).getMonth() === currentMonth && new Date(t.transaction_date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const monthlyExpense = transactions
        .filter(t => t.type === 'expense' && new Date(t.transaction_date).getMonth() === currentMonth && new Date(t.transaction_date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const formatChartData = () => {
        if (chartView === 'day') {
            const days = [];
            const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const mStr = String(selectedMonth).padStart(2, '0');
                const dStr = String(i).padStart(2, '0');
                const key = `${selectedYear}-${mStr}-${dStr}`;
                days.push({ dateKey: key, name: `${i}/${selectedMonth}`, income: 0, expense: 0 });
            }
            transactions.forEach(t => {
                const tDate = new Date(t.transaction_date);
                const key = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}-${String(tDate.getDate()).padStart(2, '0')}`;
                const dayData = days.find(d => d.dateKey === key);
                if (dayData) {
                    if (t.type === 'income') dayData.income += parseFloat(t.amount);
                    if (t.type === 'expense') dayData.expense += parseFloat(t.amount);
                }
            });
            return days;
        } else if (chartView === 'month') {
            const months = Array.from({ length: 12 }, (_, i) => ({ monthIndex: i, name: `T${i + 1}`, income: 0, expense: 0 }));
            transactions.forEach(t => {
                const tDate = new Date(t.transaction_date);
                if (tDate.getFullYear() === selectedYear) {
                    const monthData = months[tDate.getMonth()];
                    if (monthData) {
                        if (t.type === 'income') monthData.income += parseFloat(t.amount);
                        if (t.type === 'expense') monthData.expense += parseFloat(t.amount);
                    }
                }
            });
            return months;
        } else if (chartView === 'year') {
            const years = availableYears.map(year => ({ year, name: `${year}`, income: 0, expense: 0 })).sort((a, b) => a.year - b.year);
            transactions.forEach(t => {
                const yearData = years.find(y => y.year === new Date(t.transaction_date).getFullYear());
                if (yearData) {
                    if (t.type === 'income') yearData.income += parseFloat(t.amount);
                    if (t.type === 'expense') yearData.expense += parseFloat(t.amount);
                }
            });
            return years;
        }
        return [];
    };

    const chartData = formatChartData();

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: 20 },
        show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
        >
            {/* Overview Cards Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {[
                    { label: 'Tổng Số Dư', value: `${totalBalance.toLocaleString()} ₫`, icon: <FiDollarSign size={24} />, bg: 'rgba(79, 70, 229, 0.15)', color: 'var(--primary-color)', shadow: 'rgba(79, 70, 229, 0.25)' },
                    { label: 'Tổng Thu (Tháng này)', value: `${monthlyIncome.toLocaleString()} ₫`, icon: <FiTrendingUp size={24} />, bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--success-color)', shadow: 'rgba(16, 185, 129, 0.25)' },
                    { label: 'Tổng Chi (Tháng này)', value: `${monthlyExpense.toLocaleString()} ₫`, icon: <FiTrendingDown size={24} />, bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger-color)', shadow: 'rgba(239, 68, 68, 0.25)' }
                ].map((card, idx) => (
                    <motion.div 
                        key={idx}
                        className="glass-panel" 
                        whileHover={{ y: -6, scale: 1.02, boxShadow: `0 12px 30px -5px ${card.shadow}`, borderColor: `${card.color}40` }}
                        transition={{ type: "spring", stiffness: 300, damping: 18 }}
                        style={{ 
                            padding: '24px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '20px', 
                            cursor: 'pointer', 
                            borderRadius: '16px', 
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(12px)',
                            transition: 'border-color 0.3s ease'
                        }}
                    >
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                            {card.icon}
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>{card.label}</div>
                            <div style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>{card.value}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', alignItems: 'start' }}>
                
                {/* Chart Block */}
                <motion.div 
                    className="glass-panel" 
                    style={{ padding: '24px', borderRadius: '16px', background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255, 255, 255, 0.03)' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Biểu Đồ Thu Chi</h3>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {['day', 'month'].includes(chartView) && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {chartView === 'day' && (
                                        <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} style={selectStyle}>
                                            {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>)}
                                        </select>
                                    )}
                                    <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} style={selectStyle}>
                                        {availableYears.map(year => <option key={year} value={year}>Năm {year}</option>)}
                                    </select>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                {['day', 'month', 'year'].map(view => (
                                    <button key={view} onClick={() => setChartView(view)} style={{...btnToggleStyle, background: chartView === view ? 'var(--primary-color)' : 'transparent', fontWeight: chartView === view ? 'bold' : 'normal' }}>
                                        {view === 'day' ? 'Theo ngày' : view === 'month' ? 'Theo tháng' : 'Theo năm'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--text-secondary)" tickLine={false} dy={5} style={{ fontSize: '12px' }} />
                                <YAxis stroke="var(--text-secondary)" tickLine={false} tickFormatter={formatYAxis} dx={-5} style={{ fontSize: '12px' }} />
                                
                                {/* Đồng bộ Custom Glassmorphism Tooltip từ Admin */}
                                <RechartsTooltip 
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const income = payload.find(p => p.dataKey === 'income')?.value || 0;
                                            const expense = payload.find(p => p.dataKey === 'expense')?.value || 0;
                                            const total = income - expense;

                                            return (
                                                <div style={{
                                                    background: 'rgba(30, 41, 59, 0.75)',
                                                    backdropFilter: 'blur(16px)',
                                                    WebkitBackdropFilter: 'blur(16px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                                    borderRadius: '14px',
                                                    padding: '16px',
                                                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255,255,255,0.1)',
                                                    minWidth: '220px',
                                                    color: '#ffffff'
                                                }}>
                                                    <div style={{ 
                                                        fontSize: '12px', 
                                                        fontWeight: '700', 
                                                        textTransform: 'uppercase', 
                                                        color: '#94a3b8', 
                                                        marginBottom: '12px',
                                                        letterSpacing: '0.5px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between'
                                                    }}>
                                                        <span>Thời gian: {label}</span>
                                                        <span style={{ fontSize: '14px' }}>📅</span>
                                                    </div>
                                                    
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4d4f' }}>
                                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ff4d4f' }}></span>
                                                                <span>Chi tiêu:</span>
                                                            </div>
                                                            <span style={{ fontWeight: '600' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(expense)}</span>
                                                        </div>

                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#20ce88' }}>
                                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#20ce88' }}></span>
                                                                <span>Thu nhập:</span>
                                                            </div>
                                                            <span style={{ fontWeight: '600' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(income)}</span>
                                                        </div>

                                                        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                                                            <span style={{ color: '#cbd5e1' }}>Thực thu nét:</span>
                                                            <span style={{ 
                                                                fontWeight: '700', 
                                                                color: total >= 0 ? '#20ce88' : '#ff4d4f' 
                                                            }}>
                                                                {total >= 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                
                                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', paddingBottom: '10px' }} />
                                <Bar dataKey="income" fill="var(--success-color)" name="Thu Nhập" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1000} animationEasing="ease-out" />
                                <Bar dataKey="expense" fill="var(--danger-color)" name="Chi Tiêu" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1000} animationEasing="ease-out" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Recent Transactions Block */}
                <motion.div 
                    className="glass-panel" 
                    style={{ padding: '24px', borderRadius: '16px', background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255, 255, 255, 0.03)' }}
                >
                    <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Giao Dịch Gần Đây</h3>
                    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {recentTransactions.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0', fontSize: '14px' }}>Không có giao dịch nào</div>
                        ) : (
                            recentTransactions.map(tx => (
                                <motion.div key={tx.id} variants={itemVariants} whileHover={{ x: 6 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: tx.type === 'income' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tx.type === 'income' ? 'var(--success-color)' : 'var(--danger-color)' }}>
                                            {tx.type === 'income' ? <FiTrendingUp size={18} /> : <FiTrendingDown size={18} />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-primary)' }}>{tx.note || (tx.category?.name || 'Khác')}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(tx.transaction_date).toLocaleDateString('vi-VN')}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: tx.type === 'income' ? 'var(--success-color)' : 'var(--text-primary)' }}>
                                        {tx.type === 'income' ? '+' : '-'}{parseFloat(tx.amount).toLocaleString()} ₫
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
};

const selectStyle = { background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', padding: '6px 12px', outline: 'none', cursor: 'pointer', fontSize: '14px' };
const btnToggleStyle = { border: 'none', borderRadius: '6px', color: 'var(--text-primary)', padding: '6px 12px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.25s ease' };

export default Dashboard;