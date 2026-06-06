import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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
        <div>
            <h2 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--primary-color)' }}>Đăng Ký</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>Tạo tài khoản mới</p>
            
            {error && <div style={{ color: 'var(--danger-color)', marginBottom: '16px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Họ Tên</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="glass-input" 
                        placeholder="Tên của bạn"
                        required 
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Email</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="glass-input" 
                        placeholder="Email của bạn"
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
                        placeholder="Mật khẩu (ít nhất 8 ký tự)"
                        required 
                        minLength={8}
                    />
                </div>
                <button type="submit" className="glass-button" style={{ marginTop: '12px' }}>
                    Đăng Ký
                </button>
            </form>
            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
                Đã có tài khoản? <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>Đăng nhập</Link>
            </div>
        </div>
    );
};

export default Register;
