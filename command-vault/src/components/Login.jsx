import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(username, password);
    if (!res.success) {
      Swal.fire({
        title: 'Acceso Denegado',
        text: res.error,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        background: '#1e293b',
        color: '#f8fafc',
      });
    }
  };

  return (
    <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass" style={{ padding: '3rem', borderRadius: '1.5rem', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)', marginBottom: '1rem' }}>
            <Terminal size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', letterSpacing: '0.05em' }}>COMMAND VAULT</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Login to your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <input
              type="text"
              placeholder="Username"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.875rem' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
