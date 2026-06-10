import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FiUsers, FiCreditCard, FiActivity, FiGrid } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userChartRange, setUserChartRange] = useState('30'); // '7', '30', 'all'
    const [userChartType, setUserChartType] = useState('daily'); // 'daily', 'cumulative'

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

    // Data parsing with filtering & cumulative options
    const { processedUserChartData, userMetrics } = React.useMemo(() => {
        if (!stats?.usersGrowth || stats.usersGrowth.length === 0) {
            return {
                processedUserChartData: [],
                userMetrics: { total: 0, avg: 0, trend: { percent: 0, isUp: true } }
            };
        }

        let rawData = [...stats.usersGrowth];

        // Find reference date (latest date in dataset or today)
        const latestDateStr = rawData[rawData.length - 1]?.date;
        const refDate = latestDateStr ? new Date(latestDateStr) : new Date();

        // 1. Calculate growth trend (Period-over-Period)
        const limitDays = userChartRange === 'all' ? 30 : parseInt(userChartRange);

        const period1Start = new Date(refDate);
        period1Start.setDate(period1Start.getDate() - limitDays + 1);
        period1Start.setHours(0, 0, 0, 0);

        const period2Start = new Date(refDate);
        period2Start.setDate(period2Start.getDate() - (limitDays * 2) + 1);
        period2Start.setHours(0, 0, 0, 0);

        let currentPeriodCount = 0;
        let previousPeriodCount = 0;

        rawData.forEach(item => {
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0);
            if (itemDate >= period1Start && itemDate <= refDate) {
                currentPeriodCount += item.count;
            } else if (itemDate >= period2Start && itemDate < period1Start) {
                previousPeriodCount += item.count;
            }
        });

        let trendPercent = 0;
        let isUp = true;
        if (previousPeriodCount === 0) {
            trendPercent = currentPeriodCount > 0 ? 100 : 0;
            isUp = true;
        } else {
            const diff = currentPeriodCount - previousPeriodCount;
            trendPercent = Math.round((diff / previousPeriodCount) * 100);
            isUp = diff >= 0;
        }

        // 2. Filter data for the chart based on range
        if (userChartRange !== 'all') {
            rawData = rawData.filter(item => {
                const itemDate = new Date(item.date);
                itemDate.setHours(0, 0, 0, 0);
                return itemDate >= period1Start;
            });
        }

        // 3. Compute initial cumulative offset from registrations before filtered range
        let initialCumulative = 0;
        if (userChartRange !== 'all') {
            stats.usersGrowth.forEach(item => {
                const itemDate = new Date(item.date);
                itemDate.setHours(0, 0, 0, 0);
                if (itemDate < period1Start) {
                    initialCumulative += item.count;
                }
            });
        }

        // 4. Map data with cumulative sums
        let cumulativeSum = initialCumulative;
        const chartDataMapped = rawData.map(item => {
            const d = new Date(item.date);
            cumulativeSum += item.count;
            return {
                rawDate: item.date,
                date: `${d.getDate()}/${d.getMonth() + 1}`,
                count: item.count,
                cumulative: cumulativeSum
            };
        });

        // 5. Overall statistics for the filtered range
        const total = currentPeriodCount;
        const avg = chartDataMapped.length > 0 ? (total / chartDataMapped.length).toFixed(1) : 0;

        return {
            processedUserChartData: chartDataMapped,
            userMetrics: {
                total,
                avg,
                trend: { percent: Math.abs(trendPercent), isUp }
            }
        };
    }, [stats, userChartRange]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)' }}>Đang tải hệ thống dữ liệu...</div>;

    const statCards = [
        { label: 'Tổng số Người Dùng', value: stats?.totalUsers || 0, icon: <FiUsers size={24} />, color: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.25)' },
        { label: 'Tổng số Ví', value: stats?.totalWallets || 0, icon: <FiCreditCard size={24} />, color: '#a855f7', shadow: 'rgba(168, 85, 247, 0.25)' },
        { label: 'Tổng số Giao Dịch', value: stats?.totalTransactions || 0, icon: <FiActivity size={24} />, color: '#f59e0b', shadow: 'rgba(245, 158, 11, 0.25)' },
        { label: 'Tổng số Danh Mục', value: stats?.totalCategories || 0, icon: <FiGrid size={24} />, color: '#10b981', shadow: 'rgba(16, 185, 129, 0.25)' },
    ];

    const formatTransactionData = () => {
        if (!stats?.transactionsGrowth) return [];
        const dataMap = {};
        stats.transactionsGrowth.forEach(item => {
            if (!dataMap[item.date]) {
                const d = new Date(item.date);
                dataMap[item.date] = {
                    date: `${d.getDate()}/${d.getMonth() + 1}`,
                    income: 0,
                    expense: 0
                };
            }
            if (item.type === 'income') dataMap[item.date].income += parseFloat(item.total);
            if (item.type === 'expense') dataMap[item.date].expense += parseFloat(item.total);
        });
        return Object.values(dataMap);
    };

    const txChartData = formatTransactionData();

    const tabBtnStyle = (active) => ({
        background: active ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.02)',
        border: active ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
        color: active ? '#60a5fa' : 'var(--text-secondary)',
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '12.5px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        outline: 'none'
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ padding: '4px' }}
        >
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '28px', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>Thống Kê Tổng Quan</h1>

            {/* KPI Cards Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                {statCards.map((card, index) => (
                    <motion.div
                        key={index}
                        className="glass-panel"
                        whileHover={{ y: -6, scale: 1.02, boxShadow: `0 12px 30px -5px ${card.shadow}`, borderColor: `${card.color}40` }}
                        transition={{ type: "spring", stiffness: 300, damping: 18 }}
                        style={{
                            padding: '24px',
                            borderRadius: '16px',
                            position: 'relative',
                            overflow: 'hidden',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(12px)',
                            cursor: 'pointer',
                            transition: 'border-color 0.3s ease'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500', letterSpacing: '0.2px' }}>{card.label}</h3>
                            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: `${card.color}15`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {card.icon}
                            </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '34px', fontWeight: '800', letterSpacing: '-1px', color: 'var(--text-primary)' }}>
                            {card.value.toLocaleString()}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>

                {/* Area Chart - Tăng trưởng User */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="glass-panel"
                    style={{ padding: '24px', borderRadius: '16px', background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255, 255, 255, 0.03)' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>Tăng Trưởng Người Dùng Mới</h3>

                        {/* Interactive Tabs */}
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            {/* Type Toggle */}
                            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '2px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                                <button onClick={() => setUserChartType('daily')} style={tabBtnStyle(userChartType === 'daily')}>Hằng Ngày</button>
                                <button onClick={() => setUserChartType('cumulative')} style={tabBtnStyle(userChartType === 'cumulative')}>Tích Lũy</button>
                            </div>

                            {/* Range Toggle */}
                            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '2px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                                <button onClick={() => setUserChartRange('7')} style={tabBtnStyle(userChartRange === '7')}>7 Ngày</button>
                                <button onClick={() => setUserChartRange('30')} style={tabBtnStyle(userChartRange === '30')}>30 Ngày</button>
                                <button onClick={() => setUserChartRange('all')} style={tabBtnStyle(userChartRange === 'all')}>Tất Cả</button>
                            </div>
                        </div>
                    </div>

                    {/* Summary KPI Banner */}
                    <div style={{ display: 'flex', gap: '32px', marginBottom: '24px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '16px' }}>
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                {userChartType === 'daily' ? 'Người dùng mới (Kỳ này)' : 'Tổng tăng trưởng'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                    {userMetrics.total.toLocaleString()}
                                </span>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    backgroundColor: userMetrics.trend.isUp ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                    color: userMetrics.trend.isUp ? '#10b981' : '#ef4444'
                                }}>
                                    {userMetrics.trend.isUp ? '▲' : '▼'} {userMetrics.trend.percent}%
                                </span>
                            </div>
                        </div>
                        <div style={{ width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Đăng ký Trung Bình Ngày</div>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                {userMetrics.avg} <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>user/ngày</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ height: '300px' }}>
                        {processedUserChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={processedUserChartData} margin={{ left: -20, right: 10 }}>
                                    <defs>
                                        <linearGradient id="userGlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis dataKey="date" stroke="var(--text-secondary)" tickLine={false} dy={10} style={{ fontSize: '12px' }} />
                                    <YAxis stroke="var(--text-secondary)" tickLine={false} allowDecimals={false} dx={-5} style={{ fontSize: '12px' }} />

                                    <RechartsTooltip
                                        cursor={{ stroke: 'rgba(59, 130, 246, 0.25)', strokeWidth: 1 }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const currentVal = payload[0].value;
                                                const dataObj = payload[0].payload;
                                                return (
                                                    <div style={{
                                                        background: 'rgba(30, 41, 59, 0.8)',
                                                        backdropFilter: 'blur(16px)',
                                                        WebkitBackdropFilter: 'blur(16px)',
                                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                                        borderRadius: '12px',
                                                        padding: '12px 16px',
                                                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255,255,255,0.05)',
                                                        color: '#ffffff'
                                                    }}>
                                                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>
                                                            Ngày: {dataObj.rawDate}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></span>
                                                            <span style={{ color: '#cbd5e1' }}>
                                                                {userChartType === 'daily' ? 'Đăng ký mới:' : 'Tổng tích lũy:'}
                                                            </span>
                                                            <span style={{ fontWeight: '700' }}>
                                                                {currentVal.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey={userChartType === 'daily' ? 'count' : 'cumulative'}
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fill="url(#userGlowGrad)"
                                        dot={{ r: 3, strokeWidth: 1.5, fill: '#0f172a' }}
                                        activeDot={{ r: 5, strokeWidth: 0 }}
                                        isAnimationActive={true}
                                        animationDuration={1000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={emptyDataStyle}>Chưa có đủ dữ liệu hệ thống</div>
                        )}
                    </div>
                </motion.div>

                {/* Bar Chart - Dòng tiền hệ thống */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="glass-panel"
                    style={{ padding: '24px', borderRadius: '16px', background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255, 255, 255, 0.03)' }}
                >
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginTop: 0, marginBottom: '24px', color: 'var(--text-primary)' }}>Dòng Tiền Hệ Thống (Thu & Chi)</h3>
                    <div style={{ height: '300px' }}>
                        {txChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={txChartData} margin={{ left: -15, right: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis dataKey="date" stroke="var(--text-secondary)" tickLine={false} dy={10} style={{ fontSize: '12px' }} />
                                    <YAxis stroke="var(--text-secondary)" tickLine={false} dx={-5} style={{ fontSize: '12px' }} tickFormatter={(val) => val >= 1e6 ? `${(val / 1e6).toFixed(0)}M` : val} />

                                    {/* Khối Custom Tooltip Kính Mờ */}
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
                                                            <span>Chi Tiết: {label}</span>
                                                            <span style={{ fontSize: '14px' }}>📅</span>
                                                        </div>

                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
                                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ff4d4f' }}></span>
                                                                    <span>Chi tiêu:</span>
                                                                </div>
                                                                <span style={{ fontWeight: '600' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(expense)}</span>
                                                            </div>

                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80' }}>
                                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#20ce88' }}></span>
                                                                    <span>Thu nhập:</span>
                                                                </div>
                                                                <span style={{ fontWeight: '600' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(income)}</span>
                                                            </div>

                                                            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                                                                <span style={{ color: '#cbd5e1' }}>Tổng hệ thống:</span>
                                                                <span style={{
                                                                    fontWeight: '700',
                                                                    color: total >= 0 ? '#4ade80' : '#f87171'
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
                                    <Bar dataKey="income" name="Thu nhập" fill="#20ce88" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1000} />
                                    <Bar dataKey="expense" name="Chi tiêu" fill="#ff4d4f" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1000} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={emptyDataStyle}>Chưa có đủ dữ liệu hệ thống</div>
                        )}
                    </div>
                </motion.div>

            </div>
        </motion.div>
    );
};

const emptyDataStyle = { display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '14px' };

export default AdminDashboard;