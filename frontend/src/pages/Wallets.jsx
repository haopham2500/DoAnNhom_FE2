import React, { useState, useEffect } from 'react';
import api from '../api';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Wallets = () => {
    const [wallets, setWallets] = useState([]);
    const [name, setName] = useState('');
    const [balance, setBalance] = useState('');
    const [currency, setCurrency] = useState('VNĐ');
    const [notification, setNotification] = useState({ type: '', text: '' });

    const showNotification = (text, type = 'error') => {
        setNotification({ type, text });
        setTimeout(() => {
            setNotification({ type: '', text: '' });
        }, 5000);
    };

    const fetchWallets = async () => {
        const res = await api.get('/wallets');
        setWallets(res.data);
    };

    useEffect(() => {
        fetchWallets();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (parseFloat(balance) < 0) {
            showNotification('Yêu cầu nhập số dương!', 'error');
            return;
        }
        try {
            await api.post('/wallets', { name, balance, currency });
            setName('');
            setBalance('');
            fetchWallets();
            showNotification('Tạo ví thành công!', 'success');
        } catch (error) {
            showNotification('Lỗi tạo ví. Vui lòng kiểm tra lại thông tin.', 'error');
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Xóa ví này?')) {
            try {
                await api.delete(`/wallets/${id}`);
                fetchWallets();
                showNotification('Xóa ví thành công!', 'success');
            } catch (error) {
                showNotification('Lỗi khi xóa ví. Vui lòng thử lại.', 'error');
            }
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}
        >
            <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Thêm Ví Mới</h3>
                
                <AnimatePresence>
                    {notification.text && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            style={{
                                padding: '12px 16px',
                                borderRadius: '8px',
                                background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: notification.type === 'success' ? '#34d399' : '#f87171',
                                border: `1px solid ${notification.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                fontSize: '14px',
                                overflow: 'hidden'
                            }}>
                            {notification.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input 
                        className="glass-input" 
                        placeholder="Tên ví (VD: Tiền mặt)" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required 
                    />
                    <input 
                        type="number"
                        min="0"
                        className="glass-input" 
                        placeholder="Số dư ban đầu" 
                        value={balance} 
                        onChange={e => setBalance(e.target.value.replace(/[^0-9.]/g, ''))} 
                        required 
                    />
                    <button type="submit" className="glass-button" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <FiPlus /> Thêm Ví
                    </button>
                </form>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ marginTop: 0 }}>Danh Sách Ví</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <AnimatePresence>
                        {wallets.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Chưa có ví nào.</p> : wallets.map((wallet, index) => (
                            <motion.div 
                                key={wallet.id}
                                className="wallet-card-glow"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                            >
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{wallet.name}</div>
                                    <div style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{parseFloat(wallet.balance).toLocaleString()} {wallet.currency}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleDelete(wallet.id)} className="glass-button" style={{ background: 'transparent', color: 'var(--danger-color)', border: '1px solid var(--danger-color)', padding: '8px' }}>
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default Wallets;