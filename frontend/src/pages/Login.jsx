import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import './Auth.css';

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
        <div className="auth-page-wrapper">
            <motion.div 
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="auth-container"
            >
                <div className="auth-header-icon-container">
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>
                <h2>Đăng Nhập</h2>
                <p className="auth-subtitle">Chào mừng trở lại với Finance App</p>
                
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="auth-error-panel"
                    >
                        {error}
                    </motion.div>
                )}
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="form-group">
                        <label>EMAIL</label>
                        <div className="input-wrapper">
                            <span className="input-icon-left">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="4" />
                                    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                                </svg>
                            </span>
                            <input 
                                type="email" 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="glass-input" 
                                placeholder="[ Nhập địa chỉ email"
                                required 
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>MẬT KHẨU</label>
                        <div className="input-wrapper">
                            <span className="input-icon-left">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                                </svg>
                            </span>
                            <input 
                                type="password" 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="glass-input" 
                                placeholder="[ Nhập mật khẩu"
                                required 
                            />
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="glass-button"
                    >
                        Đăng Nhập
                    </button>
                </form>
                
                <div className="auth-link">
                    Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;