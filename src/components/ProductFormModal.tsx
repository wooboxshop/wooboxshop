import React, { useState, useEffect } from 'react';
import { Product, Highlight, PlatformType, CategoryOption } from '../types';
import { autoFillFromUrl, fetchSubscribers } from '../services/api';
import { getAccessToken } from '../services/auth';
import { sendNewProductNotificationToSubscribers } from '../services/gmail';
import {
  X,
  Save,
  Image as ImageIcon,
  Link as LinkIcon,
  Tag,
  Sparkles,
  AlertCircle,
  Wand2,
  Loader2,
  Check,
  Mail,
} from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => Promise<void>;
  editingProduct?: Product | null;
  highlights: Highlight[];
  categories?: CategoryOption[];
}

const DEFAULT_CATEGORIES = [
  'Tech & Gadgets',
  'Tendências & Destaques',
  'Casa & Setup',
  'Moda & Estilo',
  'Beleza & Autocuidado',
  'Outros',
];

const PRESET_BADGES = [
  '🔥 Viral no TikTok',
  '⚡ Achadinho Shopee',
  '📦 Entrega Rápida ML',
  '⚡ Oferta Prime Amazon',
  '⭐ Campeão de Vendas',
  '👔 Ideia Dia dos Pais',
  '❤️ Especial Dia dos Namorados',
  '💎 Qualidade Premium',
  '📸 Sucesso no Instagram',
  '🚀 Lançamento 2026',
  '💰 Menor Preço Garantido',
  '✨ Queridinho da Galera',
];

const PLATFORMS: { id: PlatformType; name: string }[] = [
  { id: 'shopee', name: 'Shopee' },
  { id: 'amazon', name: 'Amazon' },
  { id: 'mercadolivre', name: 'Mercado Livre' },
  { id: 'tiktok', name: 'TikTok Shop' },
  { id: 'aliexpress', name: 'AliExpress' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'outros', name: 'Outro Afiliado' },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProduct,
  highlights,
  categories,
}) => {
  const categoryNames = React.useMemo(() => {
    if (categories && categories.length > 0) {
      const names = categories
        .filter((c) => c.id !== 'todos')
        .map((c) => c.name);
      return names.length > 0 ? names : DEFAULT_CATEGORIES;
    }
    return DEFAULT_CATEGORIES;
  }, [categories]);

  const [formData, setFormData] = useState<Partial<Product>>({
    title: '',
    description: '',
    price: 49.9,
    originalPrice: 89.9,
    imageUrl: '',
    affiliateUrl: '',
    category: 'Tendências & Destaques',
    platform: 'shopee',
    badge: '🔥 Achadinho Viral',
    highlightId: '',
    isFeatured: true,
    isActive: true,
    rating: 4.8,
    reviewsCount: 45,
  });

  const [loading, setLoading] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillSuccess, setAutoFillSuccess] = useState(false);
  const [error, setError] = useState('');
  const [notifySubscribers, setNotifySubscribers] = useState(true);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [gmailToken, setGmailToken] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSubscribers().then((subs) => setSubscribersCount(subs.length));
      const token = getAccessToken();
      if (token) setGmailToken(token);
    }
  }, [isOpen]);

  // Lock background body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingProduct) {
      setFormData({ ...editingProduct });
    } else {
      setFormData({
        title: '',
        description: '',
        price: 49.9,
        originalPrice: 89.9,
        imageUrl:
          'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
        affiliateUrl: '',
        category: 'Tendências & Destaques',
        platform: 'shopee',
        badge: '🔥 Achadinho Viral',
        highlightId: '',
        isFeatured: false,
        isActive: true,
        rating: 4.9,
        reviewsCount: 30,
      });
    }
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  // Smart Autofill parser based on URL link
  const handleAutoFill = async () => {
    const url = formData.affiliateUrl?.trim() || '';
    if (!url) {
      setError('Cole o link do produto no campo abaixo antes de clicar em Auto-Preencher.');
      return;
    }

    setIsAutoFilling(true);
    setError('');
    setAutoFillSuccess(false);

    try {
      const data = await autoFillFromUrl(url);
      setFormData((prev) => ({
        ...prev,
        ...data,
        affiliateUrl: url,
        title: data.title || prev.title || '',
        description: data.description || prev.description || '',
        imageUrl: data.imageUrl || prev.imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
      }));
      setAutoFillSuccess(true);
      setTimeout(() => setAutoFillSuccess(false), 3000);
    } catch (err) {
      console.error('AutoFill API call error:', err);
      const lowerUrl = url.toLowerCase();
      let detectedPlatform: PlatformType = 'outros';
      let detectedBadge = '✨ Oferta Selecionada';

      if (lowerUrl.includes('shopee') || lowerUrl.includes('shope.ee')) {
        detectedPlatform = 'shopee';
        detectedBadge = '🔥 Achadinho Shopee';
      } else if (lowerUrl.includes('amazon') || lowerUrl.includes('amzn.to') || lowerUrl.includes('a.co')) {
        detectedPlatform = 'amazon';
        detectedBadge = '⚡ Oferta Prime Amazon';
      } else if (lowerUrl.includes('mercadolivre') || lowerUrl.includes('mercado.livre') || lowerUrl.includes('meli.la') || lowerUrl.includes('mlb')) {
        detectedPlatform = 'mercadolivre';
        detectedBadge = '📦 Entrega Rápida ML';
      } else if (lowerUrl.includes('tiktok') || lowerUrl.includes('vt.tiktok')) {
        detectedPlatform = 'tiktok';
        detectedBadge = '🔥 Viral no TikTok';
      } else if (lowerUrl.includes('aliexpress') || lowerUrl.includes('s.click.aliexpress')) {
        detectedPlatform = 'aliexpress';
        detectedBadge = '🌐 Importado Choice';
      } else if (lowerUrl.includes('instagram') || lowerUrl.includes('instagr.am')) {
        detectedPlatform = 'instagram';
        detectedBadge = '📸 Destaque Instagram';
      }

      setFormData((prev) => ({
        ...prev,
        platform: detectedPlatform,
        badge: detectedBadge,
        title: prev.title || 'Produto Selecionado Mercado Livre - Oferta Oficial',
        description: prev.description || 'Produto de altíssima avaliação com entrega garantida e excelente benefício!',
        imageUrl: prev.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      }));
      setAutoFillSuccess(true);
      setTimeout(() => setAutoFillSuccess(false), 3000);
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.affiliateUrl || !formData.imageUrl) {
      setError('Por favor preencha os campos obrigatórios (Título, Imagem e Link de Afiliado).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave(formData);

      // Auto-notify subscribers via Gmail if new product & enabled
      const tokenToUse = gmailToken || getAccessToken();
      if (!editingProduct && notifySubscribers && tokenToUse) {
        try {
          const subs = await fetchSubscribers();
          if (subs.length > 0) {
            const tempProduct: Product = {
              id: formData.id || `prod-${Date.now()}`,
              title: formData.title || '',
              description: formData.description || '',
              price: Number(formData.price) || 0,
              originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
              imageUrl: formData.imageUrl || '',
              affiliateUrl: formData.affiliateUrl || '',
              category: formData.category || '',
              platform: formData.platform || 'shopee',
              badge: formData.badge || '',
              highlightId: formData.highlightId || '',
              isFeatured: formData.isFeatured ?? true,
              isActive: formData.isActive ?? true,
              clicksCount: 0,
              rating: 5,
              reviewsCount: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            sendNewProductNotificationToSubscribers(gmailToken, 'wooboxshop@gmail.com', subs, tempProduct)
              .catch((err) => console.error('Auto notify error:', err));
          }
        } catch (err) {
          console.error('Error auto sending email:', err);
        }
      }

      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="relative bg-[#0d0c15] text-zinc-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#12101f] text-white flex items-center justify-between border-b border-zinc-800/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-pink-600 to-amber-500 rounded-2xl shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h2>
              <p className="text-xs text-zinc-400">
                Gerencie as informações exibidas aos clientes na Woobox Shop.
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

          {/* Quick AI Autofill Section */}
          <div className="p-4 bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-amber-950/20 rounded-2xl border border-pink-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-pink-300 flex items-center gap-1.5 text-xs">
                <Wand2 className="w-4 h-4 text-pink-400 animate-pulse" />
                Preenchimento Inteligente via Link
              </span>
              {autoFillSuccess && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Dados Preenchidos!
                </span>
              )}
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Cole o link de afiliado e clique no botão para extrair automaticamente a plataforma, título, preços e descrição criativa!
            </p>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="url"
                value={formData.affiliateUrl || ''}
                onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })}
                placeholder="Cole o link da Shopee, Amazon, Mercado Livre, TikTok, etc..."
                className="flex-1 p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 font-mono text-xs outline-none focus:border-pink-500"
              />
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={isAutoFilling}
                className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-amber-500 hover:from-pink-700 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                {isAutoFilling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Lendo Link...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Auto-Preencher</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-extrabold text-zinc-100 block text-xs">Título do Produto *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Luminária de Pôr do Sol Sunset Lamp RGB"
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-400 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-zinc-100 block text-xs">Categoria *</label>
              <select
                value={formData.category || 'Tendências & Destaques'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 font-bold cursor-pointer"
              >
                {categoryNames.map((c) => (
                  <option key={c} value={c} className="bg-zinc-900 text-white font-semibold">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-extrabold text-zinc-100 block text-xs">
              Descrição Comercial / Resumo para Redes Sociais
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explique os benefícios, diferenciais e porque o produto está viralizando..."
              className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-400 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 font-normal leading-relaxed"
            />
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="font-extrabold text-zinc-100 block text-xs">Preço Atual (R$) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="49.90"
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-amber-400 font-black outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-zinc-100 block text-xs">Preço Original (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.originalPrice || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    originalPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="89.90"
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-300 font-semibold outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
              />
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-zinc-100 block text-xs">Plataforma *</label>
              <select
                value={formData.platform || 'shopee'}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value as PlatformType })}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-bold outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 cursor-pointer"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-zinc-900 text-white font-semibold">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-extrabold text-zinc-100 block text-xs">Selo / Tag Destaque</label>
              <input
                type="text"
                value={formData.badge || ''}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="Ex: 🔥 Achadinho Viral"
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-pink-300 font-bold outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
              />
              {/* Preset Badges Selector */}
              <div className="pt-2">
                <span className="text-[10px] text-zinc-400 font-bold block mb-1">Tags virais sugeridas:</span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
                  {PRESET_BADGES.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData({ ...formData, badge: preset })}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        formData.badge === preset
                          ? 'bg-pink-500 text-white border-pink-400 shadow-sm'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700/80 hover:border-pink-500/50'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Links Row */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="font-extrabold text-zinc-100 flex items-center gap-1.5 text-xs">
                <LinkIcon className="w-3.5 h-3.5 text-pink-400" /> Link de Afiliado Direct (URL) *
              </label>
              <input
                type="url"
                value={formData.affiliateUrl || ''}
                onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })}
                placeholder="https://shopee.com.br/seu-link-de-afiliado"
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-400 font-mono text-xs outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-zinc-100 flex items-center gap-1.5 text-xs">
                <ImageIcon className="w-3.5 h-3.5 text-pink-400" /> URL da Imagem HD *
              </label>
              <input
                type="url"
                value={formData.imageUrl || ''}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-400 font-mono text-xs outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                required
              />
            </div>
          </div>

          {/* Event Link & Status Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-800/80">
            <div className="space-y-1">
              <label className="font-extrabold text-zinc-100 flex items-center gap-1 text-xs">
                <Tag className="w-3.5 h-3.5 text-pink-400" /> Evento / Especial
              </label>
              <select
                value={formData.highlightId || ''}
                onChange={(e) => setFormData({ ...formData, highlightId: e.target.value })}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-medium outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 cursor-pointer"
              >
                <option value="" className="bg-zinc-900 text-white font-semibold">Nenhum (Geral)</option>
                {highlights.map((h) => (
                  <option key={h.id} value={h.id} className="bg-zinc-900 text-white font-semibold">
                    {h.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 sm:pt-6">
              <label className="flex items-center gap-2 cursor-pointer font-extrabold text-zinc-300">
                <input
                  type="checkbox"
                  checked={formData.isFeatured || false}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-pink-500 rounded"
                />
                <span>Destaque na Home</span>
              </label>
            </div>

            <div className="flex items-center gap-3 sm:pt-6">
              <label className="flex items-center gap-2 cursor-pointer font-extrabold text-zinc-300">
                <input
                  type="checkbox"
                  checked={formData.isActive !== undefined ? formData.isActive : true}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <span>Ativo (Visível Público)</span>
              </label>
            </div>
          </div>

          {/* Automatic Email Notification Toggle */}
          {!editingProduct && (
            <div className="p-3 bg-gradient-to-r from-pink-950/30 to-zinc-900 border border-pink-500/20 rounded-2xl flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-extrabold text-pink-300 text-xs">
                <input
                  type="checkbox"
                  checked={notifySubscribers}
                  onChange={(e) => setNotifySubscribers(e.target.checked)}
                  className="w-4 h-4 accent-pink-500 rounded"
                />
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-pink-400" />
                  Enviar e-mail automático para os {subscribersCount} inscritos na newsletter
                </span>
              </label>
              {gmailToken ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full shrink-0">
                  Gmail Ativo
                </span>
              ) : (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded-full shrink-0">
                  Conectar Gmail
                </span>
              )}
            </div>
          )}

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
              <span>{loading ? 'Salvando...' : 'Salvar Produto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
