import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { getMe } from '../services/api.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.get('/csrf/');
      await api.post('/auth/login/', { username, password });
      const { data: userData } = await getMe();
      login(userData);           // seta o usuário sem resetar `loading`
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Usuário ou senha incorretos.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      {/* Background glow effect */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="w-full max-w-sm relative">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #a78bfa 100%)',
              boxShadow: '0 0 40px rgba(124,58,237,0.5)',
            }}
          >
            <span className="text-3xl">⚡</span>
          </div>
          <h1
            className="text-3xl font-bold text-text-primary"
            style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
          >
            HALT
          </h1>
          <p className="text-text-secondary text-sm mt-1">Seu treino, sua evolução.</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(18,16,42,0.8)',
            border: '1px solid rgba(124,58,237,0.2)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          }}
        >
          <h2 className="text-xl font-semibold text-text-primary mb-6">Entrar</h2>

          {error && (
            <div
              className="mb-4 p-3 rounded-xl text-sm text-red-300"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
                Usuário
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="seu_usuario"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.8)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.3)')}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
                Senha
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.8)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.3)')}
              />
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '0.875rem',
                borderRadius: '0.875rem',
                background: loading
                  ? 'rgba(124,58,237,0.4)'
                  : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                color: '#fff',
                fontWeight: '600',
                fontSize: '0.95rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 0 20px rgba(124,58,237,0.4)',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.boxShadow = '0 0 30px rgba(124,58,237,0.7)';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.boxShadow = '0 0 20px rgba(124,58,237,0.4)';
              }}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-text-muted text-xs mt-6">
          Administrador?{' '}
          <a
            href="/admin/login/"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            Acessar painel
          </a>
        </p>
      </div>
    </div>
  );
}
