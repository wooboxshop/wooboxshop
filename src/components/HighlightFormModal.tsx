import React, { useState, useEffect } from 'react';
import { Highlight } from '../types';
import { X, Save, Sparkles, AlertCircle } from 'lucide-react';
import { AVAILABLE_CATEGORY_ICONS } from '../utils/categoryIcons';

interface HighlightFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (highlightData: Partial<Highlight>) => Promise<void>;
  editingHighlight?: Highlight | null;
}

export const HighlightFormModal: React.FC<HighlightFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingHighlight,
}) => {
  const [formData, setFormData] = useState<Partial<Highlight>>({
    title: '',
    subtitle: '',
    badge: 'EDICAO ESPECIAL',
    bannerUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
    themeColor: 'from-pink-600 via-rose-500 to-purple-600',
    iconName: 'Gift',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingHighlight) {
      setFormData({ ...editingHighlight });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        badge: 'DESTAQUE ESPECIAL',
        bannerUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
        themeColor: 'from-amber-600 via-rose-600 to-pink-600',
        iconName: 'Sparkles',
        isActive: true,
      });
    }
  }, [editingHighlight, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.bannerUrl) {
      setError('Por favor preencha os campos obrigatórios (Título e URL do Banner).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar destaque. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="relative bg-[#0d0c15] text-zinc-100 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#12101f] text-white flex items-center justify-between border-b border-zinc-800/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-pink-600 to-amber-500 rounded-2xl shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {editingHighlight ? 'Editar Evento / Destaque' : 'Novo Evento / Destaque'}
              </h2>
              <p className="text-xs text-zinc-400">
                Configure coleções e banners para datas especiais.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-extrabold text-zinc-200 block">Título do Evento *</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Especial Dia dos Pais 👔"
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-extrabold text-sm outline-none focus:border-pink-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-extrabold text-zinc-200 block">Subtítulo / Chamada de Destaque</label>
            <input
              type="text"
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Ex: Presentes imperdíveis com descontos de até 50%"
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-extrabold text-zinc-200 block">Selo Superior (Badge)</label>
              <input
                type="text"
                value={formData.badge || ''}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="Ex: EDICAO ESPECIAL"
                className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-pink-300 uppercase font-extrabold outline-none focus:border-pink-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-zinc-200 block">Ícone</label>
              <select
                value={formData.iconName || 'Gift'}
                onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-bold outline-none focus:border-pink-500"
              >
                {AVAILABLE_CATEGORY_ICONS.map((ico) => (
                  <option key={ico.name} value={ico.name} className="bg-zinc-900 text-white">
                    {ico.label} ({ico.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-extrabold text-zinc-200 block">URL do Banner de Fundo (Imagem HD) *</label>
            <input
              type="url"
              value={formData.bannerUrl || ''}
              onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 font-mono text-xs outline-none focus:border-pink-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="font-extrabold text-zinc-200 block">
              Gradiente de Cores & Presets (Escolha Visual)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { name: 'Laranja e Rosa (Dia dos Pais)', gradient: 'from-amber-600 via-rose-600 to-pink-600', preview: 'bg-gradient-to-r from-amber-600 via-rose-600 to-pink-600' },
                { name: 'Rosa e Roxo (Dia dos Namorados)', gradient: 'from-pink-600 via-rose-500 to-purple-600', preview: 'bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600' },
                { name: 'Fuchsia & Neon (TikTok Virais)', gradient: 'from-fuchsia-600 via-pink-500 to-purple-700', preview: 'bg-gradient-to-r from-fuchsia-600 via-pink-500 to-purple-700' },
                { name: 'Azul & Índigo (Gamer & Tech)', gradient: 'from-blue-600 via-indigo-600 to-purple-700', preview: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700' },
                { name: 'Verde & Ciano (Ofertas Verão)', gradient: 'from-emerald-600 via-teal-600 to-cyan-700', preview: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700' },
                { name: 'Ouro & Bronze (Black Friday / Luxo)', gradient: 'from-yellow-600 via-amber-600 to-orange-700', preview: 'bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-700' },
                { name: 'Vermelho Fogo (Promos Relâmpago)', gradient: 'from-red-600 via-rose-600 to-orange-600', preview: 'bg-gradient-to-r from-red-600 via-rose-600 to-orange-600' },
                { name: 'Roxo Profundo (Cyber Special)', gradient: 'from-purple-700 via-indigo-700 to-slate-900', preview: 'bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900' },
                { name: 'Ciano & Menta (Fresh Curadoria)', gradient: 'from-teal-500 via-emerald-500 to-cyan-600', preview: 'bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-600' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData({ ...formData, themeColor: p.gradient })}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                    formData.themeColor === p.gradient
                      ? 'border-pink-500 bg-pink-500/10 ring-2 ring-pink-500/30'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                >
                  <div className={`h-4 w-full rounded-lg ${p.preview} shadow-sm`} />
                  <span className="text-[10px] font-bold text-zinc-300 line-clamp-1">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-extrabold text-zinc-300">
              <input
                type="checkbox"
                checked={formData.isActive !== undefined ? formData.isActive : true}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 accent-pink-500 rounded"
              />
              <span>Ativo e Exibido na Página Inicial</span>
            </label>
          </div>

          {/* Buttons Footer */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl border border-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-amber-500 hover:from-pink-700 hover:to-amber-600 text-white font-black rounded-xl shadow-lg shadow-pink-500/20 flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Salvando...' : 'Salvar Destaque'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
