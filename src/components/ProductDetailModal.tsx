import React, { useState } from 'react';
import { Product } from '../types';
import { formatCurrency, calculateDiscount, getPlatformBadgeColor } from '../utils/helpers';
import {
  X,
  ExternalLink,
  ShoppingBag,
  Star,
  Share2,
  Check,
  ShieldCheck,
  Flame,
  Truck,
  Heart,
  Tag,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyClick: (product: Product) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onShareClick?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onBuyClick,
  isFavorite,
  onToggleFavorite,
  onShareClick,
}) => {
  const [copied, setCopied] = useState(false);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [product]);

  if (!product) return null;

  const discount = calculateDiscount(product.price, product.originalPrice);
  const platformBadge = getPlatformBadgeColor(product.platform);

  const handleShare = () => {
    if (onShareClick) {
      onShareClick(product);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(product.affiliateUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative bg-[#0d0c15] text-zinc-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700/60 backdrop-blur-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Image Section */}
        <div className="md:w-1/2 relative bg-zinc-950 min-h-[280px] md:min-h-full">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent md:hidden" />
          <div className="absolute inset-0 shadow-[inset_0_0_48px_20px_rgba(5,5,8,0.4)] pointer-events-none" />

          {/* Badges on Image */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <span className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md ${platformBadge.bg} ${platformBadge.text}`}>
              {platformBadge.label}
            </span>
            {product.badge && (
              <span className="px-3 py-1 rounded-xl bg-zinc-950/80 text-pink-200 text-xs font-extrabold shadow-md flex items-center gap-1 border border-pink-400/30 backdrop-blur-sm">
                <Tag className="w-3.5 h-3.5 text-pink-300" />
                {product.badge}
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white z-10 md:hidden">
            <span className="text-2xl font-black">{formatCurrency(product.price)}</span>
            <span className="text-xs bg-zinc-950/90 border border-zinc-800 px-2.5 py-1 rounded-xl flex items-center gap-1 font-bold text-pink-400">
              <Flame className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
              {product.clicksCount} acessos
            </span>
          </div>
        </div>

        {/* Right Info Section */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-4">
            {/* Category & Ratings */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-xl border border-pink-500/30">
                {product.category}
              </span>

              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-zinc-500 font-normal">({product.reviewsCount} avaliações)</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {product.title}
            </h2>

            {/* Pricing Box */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 font-medium">Preço Promocional:</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-white">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-zinc-500 line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {discount > 0 && (
                <span className="px-3 py-1.5 bg-emerald-500 text-zinc-950 font-black text-xs rounded-xl shadow-md">
                  -{discount}% OFF
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Descrição do Produto
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                {product.description}
              </p>
            </div>

            {/* Guarantees List */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800 text-xs text-zinc-400 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Loja Oficial Segura</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-pink-400 shrink-0" />
                <span>Compra Direta na Loja</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <button
              onClick={() => onBuyClick(product)}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-pink-500/25 flex items-center justify-center gap-2.5 transition-transform active:scale-98"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Ir para Oferta na {platformBadge.label}</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex-1 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold rounded-2xl border border-zinc-800 flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Link Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Compartilhar</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onToggleFavorite(product.id)}
                className={`p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                  isFavorite
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
                title={isFavorite ? 'Remover dos salvos' : 'Salvar produto'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
