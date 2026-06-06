import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiRefreshCw } from 'react-icons/fi';

const ManageTransactions = () => {
    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterType, setFilterType] = useState('all');
    const [searchUser, setSearchUser] = useState('');
    const [searchNote, setSearchNote] = useState('');

    const fetchAllTransactions = async () => {
        try {
            const [txRes, trRes] = await Promise.all([
                api.get('/admin/transactions'),
                api.get('/admin/transfers')
            ]);
            
            const transactions = txRes.data;
            const transfers = trRes.data;

            const merged = [
                ...transactions.map(t => ({ ...t, _type: 'transaction' })),
                ...transfers.map(t => ({ ...t, _type: 'transfer', transaction_date: t.transfer_date }))
            ].sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

            setHistoryList(merged);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu giao dịch toàn hệ thống', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllTransactions();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Đang tải danh sách giao dịch...</div>;

    const filteredList = historyList.filter(item => {
        let matchesType = true;
        if (filterType !== 'all') {
            if (filterType === 'transfer') matchesType = item._type === 'transfer';
            else matchesType = item._type === 'transaction' && item.type === filterType;
        }

        let matchesUser = true;
        if (searchUser.trim() !== '') {
            const userName = item.user?.name || '';
            matchesUser = userName.toLowerCase().includes(searchUser.toLowerCase());
        }

        let matchesNote = true;
        if (searchNote.trim() !== '') {
            const note = item.note || '';
            matchesNote = note.toLowerCase().includes(searchNote.toLowerCase());
        }

        return matchesType && matchesUser && matchesNote;
    });

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: 'var(--success-color)', display: 'flex' }}><FiDollarSign /></div> Kiểm Toán Giao Dịch
                </h1>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <select 
                    className="glass-input" 
                    value={filterType} 
                    onChange={e => setFilterType(e.target.value)}
                    style={{ flex: '1', minWidth: '150px' }}
                >
                    <option value="all">Tất cả loại giao dịch</option>
                    <option value="income">Thu nhập</option>
                    <option value="expense">Chi phí</option>
                    <option value="transfer">Chuyển tiền</option>
                </select>

                <input 
                    type="text" 
                    className="glass-input" 
                    placeholder="Tìm theo người dùng..." 
                    value={searchUser} 
                    onChange={e => setSearchUser(e.target.value)}
                    style={{ flex: '2', minWidth: '200px' }}
                />

                <input 
                    type="text" 
                    className="glass-input" 
                    placeholder="Tìm theo ghi chú..." 
                    value={searchNote} 
                    onChange={e => setSearchNote(e.target.value)}
                    style={{ flex: '2', minWidth: '200px' }}
                />
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                            <tr>
                                <th style={thStyle}>ID</th>
                                <th style={thStyle}>Người Dùng</th>
                                <th style={thStyle}>Loại</th>
                                <th style={thStyle}>Số Tiền</th>
                                <th style={thStyle}>Nguồn / Đích</th>
                                <th style={thStyle}>Ghi Chú</th>
                                <th style={thStyle}>Ngày Giao Dịch</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredList.map((item) => (
                                <tr key={`${item._type}-${item.id}`} style={{ transition: 'background 0.3s ease' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>
                                        {item._type === 'transfer' ? `TR-${item.id}` : `TX-${item.id}`}
                                    </td>
                                    <td style={{ ...tdStyle, fontWeight: 'bold' }}>
                                        {item.user?.name || 'Unknown'}
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {item._type === 'transfer' ? (
                                                <span style={{ color: '#c084fc', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                                                    <FiRefreshCw /> Chuyển
                                                </span>
                                            ) : (item.type === 'income' ? (
                                                <span style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                                                    <FiTrendingUp /> Thu nhập
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                                                    <FiTrendingDown /> Chi phí
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ ...tdStyle, fontWeight: 'bold', color: item._type === 'transfer' ? '#c084fc' : (item.type === 'income' ? 'var(--success-color)' : 'var(--danger-color)') }}>
                                        {parseFloat(item.amount).toLocaleString()}
                                    </td>
                                    <td style={{ ...tdStyle, color: '#e2e8f0' }}>
                                        {item._type === 'transfer' 
                                            ? `${item.from_wallet?.name} ➔ ${item.to_wallet?.name}` 
                                            : `${item.wallet?.name} (${item.category?.name || 'Trống'})`
                                        }
                                    </td>
                                    <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>
                                        {item.note || '-'}
                                    </td>
                                    <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>
                                        {new Date(item.transaction_date).toLocaleDateString('vi-VN')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredList.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Không tìm thấy giao dịch nào phù hợp.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageTransactions;
