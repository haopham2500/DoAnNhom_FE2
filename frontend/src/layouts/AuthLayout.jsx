import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AuthLayout = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Đang tải...</div>;
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '40px', borderRadius: '24px' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
