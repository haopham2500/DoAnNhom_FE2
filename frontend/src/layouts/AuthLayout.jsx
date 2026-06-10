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
        <div className="auth-layout-wrapper">
            <Outlet />
        </div>
    );
};

export default AuthLayout;
