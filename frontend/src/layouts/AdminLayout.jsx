import React, { useContext } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiHome, FiUsers, FiLogOut, FiPieChart, FiList, FiActivity, FiDollarSign } from 'react-icons/fi';

const AdminLayout = () => {
    const { user, loading, logout } = useContext(AuthContext);
    const location = useLocation();

    if (loading) return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Đang tải...</div>;

    if (!user || user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    const isActive = (path) => location.pathname === path;

    const navLinkStyle = (path) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        textDecoration: 'none',
        color: isActive(path) ? 'white' : 'var(--text-secondary)',
        background: isActive(path) ? 'var(--primary-color)' : 'transparent',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        fontWeight: isActive(path) ? 'bold' : 'normal',
    });

    return (
        <div style={{ display: 'flex', minHeight: '100vh', color: 'var(--text-primary)' }}>
            {/* Admin Sidebar */}
            <div className="glass-panel" style={{ width: '250px', height: 'calc(100vh - 32px)', margin: '16px', display: 'flex', flexDirection: 'column', position: 'sticky', top: '16px' }}>
                <div style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
                    <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>Admin Panel</h2>
                </div>

                <nav style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Link to="/admin" style={navLinkStyle('/admin')}>
                        <FiPieChart size={20} /> Dashboard
                    </Link>
                    <Link to="/admin/users" style={navLinkStyle('/admin/users')}>
                        <FiUsers size={20} /> Quản lý Users
                    </Link>
                    <Link to="/admin/transactions" style={navLinkStyle('/admin/transactions')}>
                        <FiDollarSign size={20} /> Kiểm toán Giao dịch
                    </Link>
                    <Link to="/admin/categories" style={navLinkStyle('/admin/categories')}>
                        <FiList size={20} /> Quản lý Danh mục
                    </Link>
                    <Link to="/admin/logs" style={navLinkStyle('/admin/logs')}>
                        <FiActivity size={20} /> Lịch sử hoạt động
                    </Link>
                </nav>

                <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Link to="/" style={{ ...navLinkStyle('/'), color: 'var(--text-secondary)' }}>
                        <FiHome size={20} /> Về trang User
                    </Link>
                    <button
                        onClick={logout}
                        style={{ width: '100%', background: 'transparent', color: 'var(--danger-color)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s ease' }}
                        onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                        onMouseOut={(e) => e.target.style.background = 'transparent'}
                    >
                        <FiLogOut size={20} /> Đăng xuất
                    </button>
                </div>
            </div>

            {/* Admin Main Content */}
            <div style={{ flex: 1, padding: '16px 32px 32px 16px', overflowY: 'auto' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
