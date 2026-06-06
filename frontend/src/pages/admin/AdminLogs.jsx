import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FiClock, FiActivity } from 'react-icons/fi';

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

    if (loading) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Đang tải lịch sử hoạt động...</div>;

    const thStyle = {
        padding: '16px',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'left',
        color: 'var(--text-secondary)',
        fontWeight: 'normal',
        textTransform: 'uppercase',
        fontSize: '14px',
        letterSpacing: '1px'
    };

    const tdStyle = {
        padding: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    };

    return (
        <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: 'var(--primary-color)', display: 'flex' }}><FiActivity /></div> Lịch Sử Hoạt Động (Logs)
            </h1>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
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
                                <tr key={log.id} style={{ transition: 'background 0.3s ease' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>#{log.id}</td>
                                    <td style={{ ...tdStyle, fontWeight: 'bold' }}>{log.user ? log.user.name : 'Unknown'}</td>
                                    <td style={tdStyle}>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '6px', 
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            background: 'rgba(59, 130, 246, 0.2)',
                                            color: '#60a5fa'
                                        }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, color: '#e2e8f0', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.details}>
                                        {log.details}
                                    </td>
                                    <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FiClock /> {new Date(log.created_at).toLocaleString('vi-VN')}
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
        </div>
    );
};

export default AdminLogs;
