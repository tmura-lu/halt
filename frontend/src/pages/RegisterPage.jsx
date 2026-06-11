import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { registerUser } from '../services/api.js';
import api from '../services/api.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    nome: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const validate = () => {
    if (!form.username.trim()) return 'Nome de usuário é obrigatório.';
    if (form.username.length < 3) return 'Nome de usuário deve ter ao menos 3 caracteres.';
    if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      return 'Nome de usuário só pode ter letras, números e _.';
    if (!form.password) return 'Senha é obrigatória.';
    if (form.password.length < 8) return 'Senha deve ter ao menos 8 caracteres.';
    if (form.password !== form.confirmPassword) return 'As senhas não coincidem.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError('');
    setLoading(true);
    try {
      // Ensure CSRF cookie is set before POST
      await api.get('/csrf/');
      const { data: userData } = await registerUser({
        username: form.username.trim(),
        password: form.password,
        email: form.email.trim() || undefined,
        nome: form.nome.trim() || undefined,
      });
      login(userData);
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Não foi possível criar a conta. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(124,58,237,0.3)',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      {/* Background glow */}
      <div
        style={{
          position: 'fixed', inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
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
          <p className="text-text-secondary text-sm mt-1">Crie sua conta e comece a treinar.</p>
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
          <h2 className="text-xl font-semibold text-text-primary mb-6">Criar Conta</h2>

          {error && (
            <div
              className="mb-4 p-3 rounded-xl text-sm text-red-300"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Nome */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
                Nome completo <span style={{ color: 'var(--color-text-muted)' }}>(opcional)</span>
              </label>
              <input
                id="reg-nome"
                type="text"
                autoComplete="name"
                value={form.nome}
                onChange={set('nome')}
                placeholder="Seu nome"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.8)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.3)')}
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
                Usuário <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                id="reg-username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={set('username')}
                required
                placeholder="seu_usuario"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.8)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.3)')}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
                E-mail <span style={{ color: 'var(--color-text-muted)' }}>(opcional)</span>
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={set('email')}
                placeholder="seu@email.com"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.8)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.3)')}
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
                Senha <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={set('password')}
                required
                placeholder="Mínimo 8 caracteres"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.8)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.3)')}
              />
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
                Confirmar senha <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                id="reg-confirm-password"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                required
                placeholder="Repita a senha"
                style={{
                  ...inputStyle,
                  borderColor:
                    form.confirmPassword && form.confirmPassword !== form.password
                      ? 'rgba(239,68,68,0.6)'
                      : 'rgba(124,58,237,0.3)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.8)')}
                onBlur={(e) => {
                  e.target.style.borderColor =
                    form.confirmPassword && form.confirmPassword !== form.password
                      ? 'rgba(239,68,68,0.6)'
                      : 'rgba(124,58,237,0.3)';
                }}
              />
              {form.confirmPassword && form.confirmPassword !== form.password && (
                <p style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>
                  As senhas não coincidem.
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              id="reg-submit"
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
              {loading ? 'Criando conta…' : 'Criar Conta'}
            </button>
          </form>
        </div>

        {/* Link para Login */}
        <p className="text-center text-text-muted text-xs mt-6">
          Já tem conta?{' '}
          <Link
            to="/login"
            className="text-text-secondary hover:text-text-primary transition-colors"
            style={{ fontWeight: 600, color: '#a78bfa' }}
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
