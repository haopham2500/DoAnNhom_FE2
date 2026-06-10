import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FiClock, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/admin/logs');
                setLogs(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)' }}>Đang truy xuất nhật ký hệ thống...</div>;

    const thStyle = {
        padding: '16px',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'left',
        color: 'var(--text-secondary)',
        fontWeight: '600',
        textTransform: 'uppercase',
        fontSize: '13px',
        letterSpacing: '0.5px'
    };

    const tdStyle = {
        padding: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        fontSize: '14px'
    };

    return (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.5px' }}>
                <div style={{ color: 'var(--primary-color)', display: 'flex' }}><FiActivity /></div> Nhật Ký Hoạt Động
            </h1>

            <div className="glass-panel" style={{ overflow: 'hidden', borderRadius: '16px' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                            <tr>
                                <th style={thStyle}>ID</th>
                                <th style={thStyle}>Quản Trị Viên</th>
                                <th style={thStyle}>Hành Động</th>
                                <th style={thStyle}>Chi Tiết</th>
                                <th style={thStyle}>Thời Gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr 
                                    key={log.id} 
                                    style={{ transition: 'background 0.2s ease', cursor: 'default' }} 
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} 
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ ...tdStyle, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>#{log.id}</td>
                                    <td style={{ ...tdStyle, fontWeight: '600' }}>{log.user ? log.user.name : 'Hệ thống'}</td>
                                    <td style={tdStyle}>
                                        <span style={{ 
                                            padding: '4px 10px', 
                                            borderRadius: '20px', 
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            background: 'rgba(59, 130, 246, 0.15)',
                                            color: '#60a5fa',
                                            border: '1px solid rgba(59, 130, 246, 0.2)'
                                        }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, color: '#cbd5e1', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.details}>
                                        {log.details}
                                    </td>
                                    <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                            <FiClock style={{ color: 'var(--primary-color)' }} /> {new Date(log.created_at).toLocaleString('vi-VN')}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {logs.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Chưa có hoạt động nào được ghi nhận.</div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default AdminLogs;