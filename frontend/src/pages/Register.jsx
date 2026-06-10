import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import './Auth.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
        } catch (err) {
            const serverMsg = err.response?.data?.message || 'Lỗi kết nối máy chủ.';
            setError(`Đăng ký thất bại: ${serverMsg}`);
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
                        {/* Coins stack */}
                        <path d="M3 12c0 1.66 2 3 4.5 3s4.5-1.34 4.5-3" />
                        <path d="M3 15c0 1.66 2 3 4.5 3s4.5-1.34 4.5-3" />
                        <path d="M3 18c0 1.66 2 3 4.5 3s4.5-1.34 4.5-3" />
                        <ellipse cx="7.5" cy="9" rx="4.5" ry="2.5" />
                        {/* Growth chart */}
                        <line x1="15" y1="18" x2="15" y2="12" />
                        <line x1="19" y1="18" x2="19" y2="8" />
                        <line x1="23" y1="18" x2="23" y2="4" />
                        <path d="M13 14l3.5-3.5 2.5 1.5 3.5-5" />
                    </svg>
                </div>
                <h2>Tạo Tài Khoản</h2>
                <p className="auth-subtitle">Bắt đầu quản lý tài chính thông minh</p>
                
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
                        <label>HỌ TÊN</label>
                        <div className="input-wrapper">
                            <span className="input-icon-left">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
                            <input 
                                type="text" 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="glass-input" 
                                placeholder="[ Tên đầy đủ của bạn"
                                required 
                            />
                        </div>
                    </div>
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
                                placeholder="[ Địa chỉ email cá nhân"
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
                                placeholder="[ Mật khẩu từ 8 ký tự"
                                required 
                                minLength={8}
                            />
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="glass-button"
                    >
                        Đăng Ký Tài Khoản
                    </button>
                </form>
                
                <div className="auth-link">
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;