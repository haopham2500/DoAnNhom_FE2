import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FiUsers, FiCreditCard, FiActivity, FiDollarSign } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Đang tải thống kê...</div>;

    const statCards = [
        { label: 'Tổng số Người Dùng', value: stats?.totalUsers || 0, icon: <FiUsers size={24} />, color: '#3b82f6' },
        { label: 'Tổng số Ví', value: stats?.totalWallets || 0, icon: <FiCreditCard size={24} />, color: '#a855f7' },
        { label: 'Tổng số Giao Dịch', value: stats?.totalTransactions || 0, icon: <FiActivity size={24} />, color: '#f59e0b' },
        { label: 'Tổng Số Dư', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.totalBalance || 0), icon: <FiDollarSign size={24} />, color: '#10b981' },
    ];

    // Format transaction growth data for BarChart
    const formatTransactionData = () => {
        if (!stats?.transactionsGrowth) return [];
        const dataMap = {};
        stats.transactionsGrowth.forEach(item => {
            if (!dataMap[item.date]) {
                dataMap[item.date] = { date: new Date(item.date).toLocaleDateString('vi-VN'), income: 0, expense: 0 };
            }
            if (item.type === 'income') dataMap[item.date].income += parseFloat(item.total);
            if (item.type === 'expense') dataMap[item.date].expense += parseFloat(item.total);
        });
        return Object.values(dataMap);
    };

    const txChartData = formatTransactionData();

    // Format user growth data
    const userChartData = stats?.usersGrowth?.map(item => ({
        date: new Date(item.date).toLocaleDateString('vi-VN'),
        count: item.count
    })) || [];

    return (
        <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>Thống Kê Tổng Quan</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                {statCards.map((card, index) => (
                    <div key={index} className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '16px', fontWeight: 'normal' }}>{card.label}</h3>
                            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: `${card.color}20`, color: card.color, display: 'flex' }}>
                                {card.icon}
                            </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>{card.value}</p>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: 0, marginBottom: '20px' }}>Tăng Trưởng Người Dùng Mới</h3>
                    <div style={{ height: '300px' }}>
                        {userChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={userChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" stroke="var(--text-secondary)" />
                                    <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
                                    <RechartsTooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="Người dùng mới" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                Chưa có đủ dữ liệu để vẽ biểu đồ
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: 0, marginBottom: '20px' }}>Dòng Tiền Hệ Thống (Thu & Chi)</h3>
                    <div style={{ height: '300px' }}>
                        {txChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={txChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" stroke="var(--text-secondary)" />
                                    <YAxis stroke="var(--text-secondary)" />
                                    <RechartsTooltip 
                                        contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }}
                                        formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                                    />
                                    <Legend />
                                    <Bar dataKey="income" name="Thu nhập" fill="#34d399" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" name="Chi tiêu" fill="#f87171" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                Chưa có đủ dữ liệu để vẽ biểu đồ
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
