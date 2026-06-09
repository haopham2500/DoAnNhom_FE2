import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const [wallets, setWallets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [chartView, setChartView] = useState('month'); // 'day', 'month', 'year'
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12

    const availableYears = useMemo(() => {
        const startYear = 2000;
        const endYear = 2028;
        const yearsSet = new Set();
        
        for (let y = startYear; y <= endYear; y++) {
            yearsSet.add(y);
        }
        
        transactions.forEach(t => {
            const y = new Date(t.transaction_date).getFullYear();
            if (y) {
                yearsSet.add(y);
            }
        });
        
        return Array.from(yearsSet).sort((a, b) => b - a);
    }, [transactions]);

    // Update selectedYear if the current year does not have transactions and there are other years
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

    // Calculate chart data based on selected view (day, month, year) and filters
    const formatChartData = () => {
        if (chartView === 'day') {
            const days = [];
            const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const mStr = String(selectedMonth).padStart(2, '0');
                const dStr = String(i).padStart(2, '0');
                const key = `${selectedYear}-${mStr}-${dStr}`;
                days.push({
                    dateKey: key,
                    name: `${i}/${selectedMonth}`,
                    income: 0,
                    expense: 0
                });
            }

            transactions.forEach(t => {
                const tDate = new Date(t.transaction_date);
                const y = tDate.getFullYear();
                const m = String(tDate.getMonth() + 1).padStart(2, '0');
                const dayVal = String(tDate.getDate()).padStart(2, '0');
                const key = `${y}-${m}-${dayVal}`;
                
                const dayData = days.find(d => d.dateKey === key);
                if (dayData) {
                    if (t.type === 'income') dayData.income += parseFloat(t.amount);
                    if (t.type === 'expense') dayData.expense += parseFloat(t.amount);
                }
            });
            return days;
        } else if (chartView === 'month') {
            const months = [];
            for (let i = 0; i < 12; i++) {
                months.push({
                    monthIndex: i,
                    name: `T${i + 1}`,
                    income: 0,
                    expense: 0
                });
            }

            transactions.forEach(t => {
                const tDate = new Date(t.transaction_date);
                const tMonth = tDate.getMonth();
                const tYear = tDate.getFullYear();
                
                if (tYear === selectedYear) {
                    const monthData = months[tMonth];
                    if (monthData) {
                        if (t.type === 'income') monthData.income += parseFloat(t.amount);
                        if (t.type === 'expense') monthData.expense += parseFloat(t.amount);
                    }
                }
            });
            return months;
        } else if (chartView === 'year') {
            const years = availableYears.map(year => ({
                year: year,
                name: `${year}`,
                income: 0,
                expense: 0
            })).sort((a, b) => a.year - b.year);

            transactions.forEach(t => {
                const tDate = new Date(t.transaction_date);
                const tYear = tDate.getFullYear();
                
                const yearData = years.find(y => y.year === tYear);
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

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
        >
            {/* Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                <motion.div 
                    whileHover={{ y: -6, scale: 1.02, boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.25)' }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="glass-panel" 
                    style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'box-shadow 0.3s ease' }}
                >
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(79, 70, 229, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', fontSize: '24px' }}>
                        <FiDollarSign />
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Tổng Số Dư</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalBalance.toLocaleString()} VNĐ</div>
                    </div>
                </motion.div>
                
                <motion.div 
                    whileHover={{ y: -6, scale: 1.02, boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.25)' }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="glass-panel" 
                    style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'box-shadow 0.3s ease' }}
                >
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success-color)', fontSize: '24px' }}>
                        <FiTrendingUp />
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Tổng Thu (Tháng này)</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{monthlyIncome.toLocaleString()} VNĐ</div>
                    </div>
                </motion.div>

                <motion.div 
                    whileHover={{ y: -6, scale: 1.02, boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.25)' }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="glass-panel" 
                    style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'box-shadow 0.3s ease' }}
                >
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger-color)', fontSize: '24px' }}>
                        <FiTrendingDown />
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Tổng Chi (Tháng này)</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{monthlyExpense.toLocaleString()} VNĐ</div>
                    </div>
                </motion.div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Chart Section */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="glass-panel" 
                    style={{ padding: '24px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>Biểu Đồ Thu Chi</h3>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {/* Dropdowns */}
                            {chartView === 'day' && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select 
                                        value={selectedMonth} 
                                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                        style={{
                                            background: 'rgba(30, 41, 59, 0.8)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: 'var(--text-primary)',
                                            padding: '6px 12px',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                        }}
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1} style={{ background: '#0f172a', color: 'var(--text-primary)' }}>
                                                Tháng {i + 1}
                                            </option>
                                        ))}
                                    </select>
                                    <select 
                                        value={selectedYear} 
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        style={{
                                            background: 'rgba(30, 41, 59, 0.8)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: 'var(--text-primary)',
                                            padding: '6px 12px',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                        }}
                                    >
                                        {availableYears.map(year => (
                                            <option key={year} value={year} style={{ background: '#0f172a', color: 'var(--text-primary)' }}>
                                                Năm {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {chartView === 'month' && (
                                <select 
                                    value={selectedYear} 
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    style={{
                                        background: 'rgba(30, 41, 59, 0.8)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                        padding: '6px 12px',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    {availableYears.map(year => (
                                        <option key={year} value={year} style={{ background: '#0f172a', color: 'var(--text-primary)' }}>
                                            Năm {year}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {/* View toggle buttons */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={() => setChartView('day')}
                                    style={{
                                        background: chartView === 'day' ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                        padding: '6px 12px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        transition: 'all 0.3s ease',
                                        fontWeight: chartView === 'day' ? 'bold' : 'normal'
                                    }}
                                >
                                    Theo ngày
                                </button>
                                <button 
                                    onClick={() => setChartView('month')}
                                    style={{
                                        background: chartView === 'month' ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                        padding: '6px 12px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        transition: 'all 0.3s ease',
                                        fontWeight: chartView === 'month' ? 'bold' : 'normal'
                                    }}
                                >
                                    Theo tháng
                                </button>
                                <button 
                                    onClick={() => setChartView('year')}
                                    style={{
                                        background: chartView === 'year' ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                        padding: '6px 12px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        transition: 'all 0.3s ease',
                                        fontWeight: chartView === 'year' ? 'bold' : 'normal'
                                    }}
                                >
                                    Theo năm
                                </button>
                            </div>
                        </div>
                    </div>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--text-secondary)" tickLine={false} />
                                <YAxis stroke="var(--text-secondary)" tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ color: 'var(--text-primary)', fontSize: '13px' }} />
                                <Bar dataKey="income" fill="var(--success-color)" name="Thu Nhập" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={800} />
                                <Bar dataKey="expense" fill="var(--danger-color)" name="Chi Tiêu" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={800} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Recent Transactions */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="glass-panel" 
                    style={{ padding: '24px' }}
                >
                    <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '18px' }}>Giao Dịch Gần Đây</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {recentTransactions.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>Không có giao dịch nào</div>
                        ) : (
                            recentTransactions.map(tx => (
                                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: tx.type === 'income' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tx.type === 'income' ? 'var(--success-color)' : 'var(--danger-color)' }}>
                                            {tx.type === 'income' ? <FiTrendingUp /> : <FiTrendingDown />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{tx.note || (tx.category?.name || 'Khác')}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(tx.transaction_date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: tx.type === 'income' ? 'var(--success-color)' : 'var(--text-primary)' }}>
                                        {tx.type === 'income' ? '+' : '-'}{parseFloat(tx.amount).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
