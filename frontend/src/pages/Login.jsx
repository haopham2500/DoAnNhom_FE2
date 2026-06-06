import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (err) {
            const serverMsg = err.response?.data?.message || 'Lỗi kết nối máy chủ.';
            setError(`Đăng nhập thất bại: ${serverMsg}`);
        }
    };

    return (
        <div>
            <h2 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--primary-color)' }}>Đăng Nhập</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>Chào mừng trở lại với Finance App</p>
            
            {error && <div style={{ color: 'var(--danger-color)', marginBottom: '16px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Email</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="glass-input" 
                        placeholder="Nhập email của bạn"
                        required 
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Mật khẩu</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="glass-input" 
                        placeholder="Nhập mật khẩu"
                        required 
                    />
                </div>
                <button type="submit" className="glass-button" style={{ marginTop: '12px' }}>
                    Đăng Nhập
                </button>
            </form>
            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
                Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>Đăng ký ngay</Link>
            </div>
        </div>
    );
};

export default Login;
