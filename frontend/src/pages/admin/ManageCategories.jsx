import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FiList, FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', type: 'expense' });
    const [notification, setNotification] = useState({ type: '', text: '' });

    const showNotification = (text, type = 'error') => {
        setNotification({ type, text });
        setTimeout(() => {
            setNotification({ type: '', text: '' });
        }, 5000);
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenModal = (category = null) => {
        if (category) {
            setFormData(category);
        } else {
            setFormData({ id: null, name: '', type: 'expense' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({ id: null, name: '', type: 'expense' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await api.put(`/admin/categories/${formData.id}`, formData);
            } else {
                await api.post('/admin/categories', formData);
            }
            fetchCategories();
            handleCloseModal();
            showNotification(formData.id ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục thành công!', 'success');
        } catch (error) {
            showNotification('Lỗi khi lưu danh mục!', 'error');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Tất cả giao dịch liên quan có thể bị ảnh hưởng!')) {
            try {
                await api.delete(`/admin/categories/${id}`);
                fetchCategories();
                showNotification('Đã xóa danh mục thành công!', 'success');
            } catch (error) {
                showNotification('Lỗi khi xóa danh mục!', 'error');
            }
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Đang tải danh sách danh mục...</div>;

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
                    <div style={{ color: 'var(--primary-color)', display: 'flex' }}><FiList /></div> Quản Lý Danh Mục
                </h1>
                <button 
                    onClick={() => handleOpenModal()} 
                    style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
                >
                    <FiPlus /> Thêm Danh Mục Mới
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
                                <th style={thStyle}>Loại</th>
                                <th style={thStyle}>Ngày Tạo</th>
                                <th style={thStyle}>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.id} style={{ transition: 'background 0.3s ease' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>#{cat.id}</td>
                                    <td style={{ ...tdStyle, fontWeight: 'bold' }}>{cat.name}</td>
                                    <td style={tdStyle}>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '6px', 
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            background: cat.type === 'income' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: cat.type === 'income' ? '#34d399' : '#f87171',
                                        }}>
                                            {cat.type === 'income' ? 'Thu Nhập' : 'Chi Tiêu'}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>
                                        {new Date(cat.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleOpenModal(cat)} style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
                                                <FiEdit2 />
                                            </button>
                                            <button onClick={() => handleDelete(cat.id)} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {categories.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Không có danh mục nào.</div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
                    <div className="glass-panel" style={{ padding: '32px', width: '100%', maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0 }}>{formData.id ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}</h2>
                            <button onClick={handleCloseModal} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <FiX size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Tên Danh Mục</label>
                                <input 
                                    className="glass-input" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required 
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Loại</label>
                                <select 
                                    className="glass-input" 
                                    value={formData.type} 
                                    onChange={e => setFormData({...formData, type: e.target.value})}
                                >
                                    <option value="expense">Chi Tiêu</option>
                                    <option value="income">Thu Nhập</option>
                                </select>
                            </div>

                            <button type="submit" className="glass-button" style={{ marginTop: '8px' }}>
                                {formData.id ? 'Cập Nhật' : 'Lưu Danh Mục'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCategories;
