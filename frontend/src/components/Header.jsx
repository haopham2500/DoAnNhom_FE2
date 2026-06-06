import React from 'react';
import { useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();
    
    const getPageTitle = () => {
        switch (location.pathname) {
            case '/': return 'Tổng quan (Dashboard)';
            case '/transactions': return 'Quản lý Giao dịch';
            case '/wallets': return 'Quản lý Ví tiền';
            case '/budgets': return 'Thiết lập Ngân sách';
            default: return 'Finance App';
        }
    };

    return (
        <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{getPageTitle()}</h1>
            
            <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Tháng {new Date().getMonth() + 1}, {new Date().getFullYear()}</span>
            </div>
        </div>
    );
};

export default Header;
