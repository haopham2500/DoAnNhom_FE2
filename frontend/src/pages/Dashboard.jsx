import React, { useState, useEffect } from 'react';
import api from '../api';
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [wallets, setWallets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    
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

    // Calculate chart data (last 6 months)
    const formatChartData = () => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push({
                month: d.getMonth(),
                year: d.getFullYear(),
                name: `T${d.getMonth() + 1}`,
                income: 0,
                expense: 0
            });
        }

        transactions.forEach(t => {
            const tDate = new Date(t.transaction_date);
            const tMonth = tDate.getMonth();
            const tYear = tDate.getFullYear();
            
            const monthData = months.find(m => m.month === tMonth && m.year === tYear);
            if (monthData) {
                if (t.type === 'income') monthData.income += parseFloat(t.amount);
                if (t.type === 'expense') monthData.expense += parseFloat(t.amount);
            }
        });

        return months;
    };

    const chartData = formatChartData();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(79, 70, 229, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', fontSize: '24px' }}>
                        <FiDollarSign />
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Tổng Số Dư</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalBalance.toLocaleString()} VNĐ</div>
                    </div>
                </div>
                
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success-color)', fontSize: '24px' }}>
                        <FiTrendingUp />
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Tổng Thu (Tháng này)</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{monthlyIncome.toLocaleString()} VNĐ</div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger-color)', fontSize: '24px' }}>
                        <FiTrendingDown />
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Tổng Chi (Tháng này)</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{monthlyExpense.toLocaleString()} VNĐ</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Chart Section */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '18px' }}>Biểu Đồ Thu Chi</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--success-color)" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="var(--success-color)" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--danger-color)" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="var(--danger-color)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                                <YAxis stroke="var(--text-secondary)" />
                                <Tooltip contentStyle={{ background: 'var(--surface-color)', border: 'none', borderRadius: '8px', color: 'var(--text-primary)' }} />
                                <Area type="monotone" dataKey="income" stroke="var(--success-color)" fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="expense" stroke="var(--danger-color)" fillOpacity={1} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="glass-panel" style={{ padding: '24px' }}>
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
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
