import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, User, Cpu, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isLogin ? 'login' : 'register';
    const payload = isLogin ? { email, password } : { username, email, password };

    try {
      const response = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, payload);
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#111827', fontFamily: 'sans-serif', color: '#f3f4f6', padding: '20px' },
    card: { width: '100%', maxWidth: '400px', backgroundColor: 'rgba(31, 41, 55, 0.6)', border: '1px solid rgba(55, 65, 81, 0.8)', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' },
    brandSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' },
    brandTitle: { fontSize: '24px', fontWeight: '800', color: '#ffffff', margin: '10px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' },
    brandSubtitle: { color: '#9ca3af', fontSize: '13px', margin: '4px 0 0 0' },
    tabs: { display: 'flex', borderBottom: '1px solid #374151', marginBottom: '24px' },
    tab: (active) => ({ flex: 1, padding: '12px', textAlignment: 'center', backgroundColor: 'transparent', border: 'none', borderBottom: active ? '2px solid #6366f1' : '2px solid transparent', color: active ? '#ffffff' : '#9ca3af', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }),
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    icon: { position: 'absolute', left: '12px', color: '#6b7280' },
    input: { width: '100%', padding: '12px 12px 12px 40px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' },
    btnSubmit: { width: '100%', padding: '12px', backgroundColor: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.2s', marginTop: '8px' },
    errorBanner: { padding: '12px', backgroundColor: 'rgba(127, 29, 29, 0.4)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '8px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '500', marginBottom: '16px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.brandSection}>
          <Cpu size={40} style={{ color: '#6366f1' }} />
          <h2 style={styles.brandTitle}>IoT System</h2>
        </div>

        <div style={styles.tabs}>
          <button style={styles.tab(isLogin)} onClick={() => { setIsLogin(true); setError(null); }}>Sign In</button>
          <button style={styles.tab(!isLogin)} onClick={() => { setIsLogin(false); setError(null); }}>Sign Up</button>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={styles.errorBanner}>
            <ShieldAlert size={18} style={{ color: '#f87171', flexShrink: 0 }} />
            <span>{error}</span>
          </motion.div>
        )}

        <form style={styles.form} onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Operator Name</label>
              <div style={styles.inputWrapper}>
                <User size={16} style={styles.icon} />
                <input style={styles.input} type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="John Doe" />
              </div>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={16} style={styles.icon} />
              <input style={styles.input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operator@company.com" />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Security Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={16} style={styles.icon} />
              <input style={styles.input} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </div>

          <button style={styles.btnSubmit} type="submit" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Authorize Access' : 'Create Operator Account'}
          </button>
        </form>
      </div>
    </div>
  );
}