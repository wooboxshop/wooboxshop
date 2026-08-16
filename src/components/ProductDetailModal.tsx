import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { formatCurrency, calculateDiscount, getPlatformBadgeColor } from '../utils/helpers';
import { PlatformIcon } from './PlatformIcon';
import { renderCategoryIcon } from '../utils/categoryIcons';
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
  Sparkles,
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
  useEffect(() => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 lg:bg-black/80 lg:backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative bg-[#0d0c15] text-zinc-100 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-900/95 hover:bg-zinc-800 text-white border border-zinc-700/60 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Image Section — standardized height on mobile (capped to max-h-[34vh]) so product info is always immediately visible */}
        <div className="w-full h-52 xs:h-56 sm:h-64 md:h-auto md:w-1/2 max-h-[34vh] md:max-h-none relative bg-zinc-950 shrink-0 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent md:hidden pointer-events-none" />
          <div className="absolute inset-0 shadow-[inset_0_0_48px_20px_rgba(5,5,8,0.4)] pointer-events-none" />

          {/* Badges on Image — compact horizontal row */}
          <div className="absolute top-3 left-3 right-3 pr-11 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
            <span className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide shadow-md flex items-center gap-1.5 ${platformBadge.bg} ${platformBadge.text}`}>
              <PlatformIcon platform={product.platform} className="w-4 h-4 shrink-0 rounded-[4px]" />
              {platformBadge.label}
            </span>
            {product.badge && (
              <span className="px-2 py-1 rounded-lg bg-zinc-950/95 text-pink-200 text-[10px] font-extrabold shadow-md flex items-center gap-1 border border-pink-400/30">
                {renderCategoryIcon(product.badgeIcon, 'w-3 h-3 text-pink-300 shrink-0')}
                {product.badge}
              </span>
            )}
            {product.isFeatured && (
              <span className="px-2 py-1 rounded-lg bg-zinc-950/95 text-amber-200 text-[10px] font-extrabold shadow-md flex items-center gap-1 border border-amber-400/30">
                <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                Destaque da Loja
              </span>
            )}
          </div>

          {/* Clicks counter — compact corner badge */}
          <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
            <span className="text-[10px] bg-zinc-950/95 border border-zinc-700/60 px-2.5 py-1 rounded-full flex items-center gap-1 font-bold text-white backdrop-blur-sm shadow-md">
              <Flame className="w-3.5 h-3.5 text-[var(--wb-primary)] fill-[var(--wb-primary)]" />
              {product.clicksCount === 1 ? '1 acesso' : `${product.clicksCount} acessos`}
            </span>
          </div>
        </div>

        {/* Right Info Section */}
        <div className="md:w-1/2 p-5 sm:p-7 md:p-8 flex flex-col justify-between overflow-y-auto space-y-5 sm:space-y-6 flex-1 min-h-0 md:flex-none">
          <div className="space-y-4">
            {/* Category & Ratings — sober, minimal treatment */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800/70 md:pr-9">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--wb-primary)]/80 shrink-0" />
                {product.category}
              </span>

              <div className="flex items-center gap-1 text-xs font-semibold text-zinc-300">
                <Star className="w-3.5 h-3.5 text-amber-400/80 fill-amber-400/80" />
                <span className="text-zinc-100">{product.rating.toFixed(1)}</span>
                <span className="text-zinc-500 font-normal">({product.reviewsCount})</span>
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
                {product.hasFreeShipping && (
                  <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold mt-1.5">
                    <Truck className="w-3.5 h-3.5 shrink-0" />
                    <span>Frete grátis para todo o Brasil</span>
                  </div>
                )}
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
                <Truck className="w-4 h-4 text-[var(--wb-primary)] shrink-0" />
                <span>Compra Direta na Loja</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <button
              onClick={() => onBuyClick(product)}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-[var(--wb-primary)] to-[var(--wb-accent)] hover:brightness-110 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-transform active:scale-98"
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
