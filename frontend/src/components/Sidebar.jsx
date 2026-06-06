import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiHome, FiCreditCard, FiList, FiPieChart, FiLogOut } from 'react-icons/fi';

const Sidebar = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', name: 'Dashboard', icon: <FiHome /> },
        { path: '/transactions', name: 'Giao dịch', icon: <FiList /> },
        { path: '/wallets', name: 'Ví tiền', icon: <FiCreditCard /> },
        { path: '/budgets', name: 'Ngân sách', icon: <FiPieChart /> },
    ];

    return (
        <div className="glass-panel" style={{ width: '250px', height: 'calc(100vh - 32px)', margin: '16px', display: 'flex', flexDirection: 'column', position: 'sticky', top: '16px' }}>
            <div style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
                <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>Finance App</h2>
            </div>
            
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {navItems.map(item => (
                    <NavLink 
                        key={item.path} 
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            textDecoration: 'none',
                            color: isActive ? 'white' : 'var(--text-secondary)',
                            background: isActive ? 'var(--primary-color)' : 'transparent',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease',
                            fontWeight: isActive ? 'bold' : 'normal',
                        })}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
                
                {user?.role === 'admin' && (
                    <NavLink 
                        to="/admin"
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            textDecoration: 'none',
                            color: 'var(--secondary-color)',
                            background: 'rgba(168, 85, 247, 0.1)',
                            border: '1px solid rgba(168, 85, 247, 0.2)',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease',
                            fontWeight: 'bold',
                            marginTop: '16px'
                        })}
                    >
                        <FiPieChart />
                        <span>Trang Admin</span>
                    </NavLink>
                )}
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{user?.name}</div>
                        <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>{user?.email}</div>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    style={{ width: '100%', background: 'transparent', color: 'var(--danger-color)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s ease' }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseOut={(e) => e.target.style.background = 'transparent'}
                >
                    <FiLogOut /> Đăng xuất
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
