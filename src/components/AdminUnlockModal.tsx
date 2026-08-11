import React, { useState } from 'react';
import { ShieldCheck, Lock, User, KeyRound, AlertCircle, Sparkles, X, Eye, EyeOff } from 'lucide-react';
import { verifyAdminCredentials } from '../services/api';

interface AdminUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessUnlock: () => void;
  initialCode?: string;
}

export const AdminUnlockModal: React.FC<AdminUnlockModalProps> = ({
  isOpen,
  onClose,
  onSuccessUnlock,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset fields when modal is opened
  React.useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setError('');
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor, informe o usuário e a senha.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isValid = await verifyAdminCredentials(username.trim(), password.trim());
      if (isValid) {
        onSuccessUnlock();
        onClose();
      } else {
        setError('Usuário ou senha incorretos. Tente novamente.');
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao autenticar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative bg-zinc-900 border border-pink-500/30 text-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow background accent */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800/60 hover:bg-zinc-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-4 rounded-3xl bg-gradient-to-tr from-pink-600 via-rose-600 to-purple-600 text-white shadow-lg ring-4 ring-pink-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2 pt-2">
            Login do Administrador
            <Sparkles className="w-4 h-4 text-pink-400" />
          </h2>
          <p className="text-xs text-zinc-400 max-w-xs">
            Informe suas credenciais para gerenciar produtos, destaques, categorias e configurações da loja.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Nome de Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário..."
              className="w-full px-4 py-3 bg-zinc-800/90 border border-zinc-700 focus:border-pink-500 rounded-2xl text-white font-medium text-sm outline-none focus:ring-4 focus:ring-pink-500/20"
              autoFocus
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" /> Senha de Acesso
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha secreta..."
                className="w-full pl-4 pr-11 py-3 bg-zinc-800/90 border border-zinc-700 focus:border-pink-500 rounded-2xl text-white font-mono text-sm tracking-wider outline-none focus:ring-4 focus:ring-pink-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !username.trim() || !password.trim()}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-pink-500/20 flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Autenticando...' : 'Entrar no Painel Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
