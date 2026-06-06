import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FiUser, FiEdit2, FiTrash2, FiEye, FiX } from 'react-icons/fi';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ id: null, name: '', role: 'user', is_locked: false });
    const [notification, setNotification] = useState({ type: '', text: '' });

    const showNotification = (text, type = 'error') => {
        setNotification({ type, text });
        setTimeout(() => {
            setNotification({ type: '', text: '' });
        }, 5000);
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handlers cho Edit
    const handleOpenEdit = (user) => {
        setFormData({ id: user.id, name: user.name, role: user.role, is_locked: user.is_locked ? true : false });
        setShowEditModal(true);
    };

    const handleCloseEdit = () => {
        setShowEditModal(false);
        setFormData({ id: null, name: '', role: 'user', is_locked: false });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/users/${formData.id}`, formData);
            fetchUsers();
            handleCloseEdit();
            showNotification('Cập nhật người dùng thành công!', 'success');
        } catch (error) {
            showNotification('Lỗi khi cập nhật người dùng!', 'error');
            console.error(error);
        }
    };

    const handleOpenView = async (user) => {
        try {
            const res = await api.get(`/admin/users/${user.id}`);
            setSelectedUser(res.data);
            setShowViewModal(true);
        } catch (error) {
            showNotification('Lỗi khi lấy thông tin chi tiết người dùng!', 'error');
        }
    };

    const handleCloseView = () => {
        setShowViewModal(false);
        setSelectedUser(null);
    };

    // Handler cho Delete
    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này ?')) {
            try {
                await api.delete(`/admin/users/${id}`);
                fetchUsers();
                showNotification('Đã xóa người dùng thành công!', 'success');
            } catch (error) {
                showNotification('Lỗi khi xóa người dùng!', 'error');
                console.error(error);
            }
        }
    };

    const handleExportCSV = () => {
        if (users.length === 0) {
            showNotification('Không có dữ liệu để xuất!', 'error');
            return;
        }
        
        const headers = ['ID', 'Tên', 'Email', 'Vai trò', 'Trạng thái', 'Số Ví', 'Số Giao Dịch', 'Ngày Tham Gia'];
        const csvRows = [headers.join(',')];
        
        users.forEach(user => {
            const status = user.is_locked ? 'Bị Khóa' : 'Hoạt Động';
            const date = new Date(user.created_at).toLocaleDateString('vi-VN');
            const row = [
                user.id,
                `"${user.name}"`,
                user.email,
                user.role,
                status,
                user.wallets_count || 0,
                user.transactions_count || 0,
                date
            ];
            csvRows.push(row.join(','));
        });
        
        const csvString = csvRows.join('\n');
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' }); // \uFEFF for UTF-8 BOM
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `DanhSachNguoiDung_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Đang tải danh sách người dùng...</div>;

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
                    <div style={{ color: 'var(--primary-color)', display: 'flex' }}><FiUser /></div> Quản Lý Người Dùng
                </h1>
                <button onClick={handleExportCSV} className="glass-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    Xuất Excel (CSV)
                </button>
            </div>

            {notification.text && (
                <div style={{
                    padding: '12px 16px',
                    marginBottom: '24px',
                    borderRadius: '8px',
                    background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: notification.type === 'success' ? '#34d399' : '#f87171',
                    border: `1px solid ${notification.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    fontSize: '14px'
                }}>
                    {notification.text}
                </div>
            )}

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                            <tr>
                                <th style={thStyle}>ID</th>
                                <th style={thStyle}>Tên</th>
                                <th style={thStyle}>Email</th>
                                <th style={thStyle}>Vai trò</th>
                                <th style={thStyle}>Trạng thái</th>
                                <th style={thStyle}>Số Ví</th>
                                <th style={thStyle}>Số Giao Dịch</th>
                                <th style={thStyle}>Ngày Tham Gia</th>
                                <th style={thStyle}>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} style={{ transition: 'background 0.3s ease' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>#{user.id}</td>
                                    <td style={{ ...tdStyle, fontWeight: 'bold' }}>{user.name}</td>
                                    <td style={{ ...tdStyle, color: '#e2e8f0' }}>{user.email}</td>
                                    <td style={tdStyle}>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '6px', 
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            background: user.role === 'admin' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                                            color: user.role === 'admin' ? '#c084fc' : '#cbd5e1',
                                            border: `1px solid ${user.role === 'admin' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(148, 163, 184, 0.3)'}`
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        {user.is_locked ? (
                                            <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>Bị Khóa</span>
                                        ) : (
                                            <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>Hoạt Động</span>
                                        )}
                                    </td>
                                    <td style={tdStyle}>{user.wallets_count}</td>
                                    <td style={tdStyle}>{user.transactions_count}</td>
                                    <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>
                                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleOpenView(user)} style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }} title="Xem chi tiết">
                                                <FiEye />
                                            </button>
                                            <button onClick={() => handleOpenEdit(user)} style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }} title="Sửa thông tin">
                                                <FiEdit2 />
                                            </button>
                                            <button onClick={() => handleDelete(user.id)} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }} title="Xóa tài khoản">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Không có người dùng nào.</div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
                    <div className="glass-panel" style={{ padding: '32px', width: '100%', maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0 }}>Cập Nhật Người Dùng</h2>
                            <button onClick={handleCloseEdit} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <FiX size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Tên Người Dùng</label>
                                <input 
                                    className="glass-input" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required 
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Vai Trò</label>
                                <select 
                                    className="glass-input" 
                                    value={formData.role} 
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                <input 
                                    type="checkbox" 
                                    id="is_locked" 
                                    checked={formData.is_locked} 
                                    onChange={e => setFormData({...formData, is_locked: e.target.checked})} 
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="is_locked" style={{ color: '#f87171', fontWeight: 'bold', cursor: 'pointer' }}>
                                    Khóa Tài Khoản
                                </label>
                            </div>

                            <button type="submit" className="glass-button" style={{ marginTop: '16px' }}>
                                Lưu Thay Đổi
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {showViewModal && selectedUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
                    <div className="glass-panel" style={{ padding: '32px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0 }}>Chi Tiết Người Dùng</h2>
                            <button onClick={handleCloseView} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <FiX size={24} />
                            </button>
                        </div>
                        
                        <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                            <p><strong>Tên:</strong> {selectedUser.name}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Vai trò:</strong> {selectedUser.role}</p>
                            <p><strong>Trạng thái:</strong> <span style={{ color: selectedUser.is_locked ? '#f87171' : '#34d399' }}>{selectedUser.is_locked ? 'Bị khóa' : 'Hoạt động'}</span></p>
                            <p><strong>Ngày tham gia:</strong> {new Date(selectedUser.created_at).toLocaleDateString('vi-VN')}</p>
                        </div>

                        <h3 style={{ marginBottom: '16px', color: 'var(--primary-color)' }}>Danh Sách Ví Đã Tạo ({selectedUser.wallets?.length || 0})</h3>
                        {selectedUser.wallets && selectedUser.wallets.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                    <tr>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Tên Ví</th>
                                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Số Dư</th>
                                        <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Tiền Tệ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedUser.wallets.map(wallet => (
                                        <tr key={wallet.id}>
                                            <td style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{wallet.name}</td>
                                            <td style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{parseFloat(wallet.balance).toLocaleString('vi-VN')}</td>
                                            <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{wallet.currency}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Người dùng này chưa tạo ví nào.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
