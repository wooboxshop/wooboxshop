import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { formatCurrency, calculateDiscount, getPlatformBadgeColor } from '../utils/helpers';
import { PlatformIcon } from './PlatformIcon';
import {
  X,
  ExternalLink,
  ShoppingBag,
  Star,
  Share2,
  Check,
  ShieldCheck,
  Truck,
  Heart,
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
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative bg-[#111116] text-zinc-100 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col md:flex-row ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Image Section */}
        <div className="w-full aspect-square max-h-[320px] sm:max-h-[380px] md:max-h-none md:w-1/2 md:aspect-square relative bg-zinc-950 shrink-0 overflow-hidden flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
            decoding="async"
          />

          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            <div className="rounded-lg backdrop-blur-md bg-black/60 p-1 border border-white/10">
              <PlatformIcon platform={product.platform} className="w-4 h-4" />
            </div>
            {discount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                -{discount}%
              </span>
            )}
          </div>
        </div>

        {/* Right Info Section */}
        <div className="md:w-1/2 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-4 flex-1 min-h-0 md:flex-none custom-scrollbar">
          <div className="space-y-3">
            {/* Category */}
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-1 pr-6">
              <span className="capitalize font-medium">
                {product.category}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
              {product.title}
            </h2>

            {/* Pricing Box */}
            <div className="p-3 rounded-xl bg-zinc-900/55 ring-1 ring-white/[0.07] flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs sm:text-sm text-zinc-400 line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                </div>
                {product.hasFreeShipping && (
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium mt-1">
                    <Truck className="w-3.5 h-3.5 shrink-0" />
                    <span>Frete grátis disponível</span>
                  </div>
                )}
              </div>

              {discount > 0 && (
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-xs rounded-md">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-xs sm:text-sm text-zinc-300/90 leading-relaxed font-normal">
                {product.description}
              </p>
            </div>

            {/* Guarantees */}
            <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2 border-t border-zinc-800/50">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Oferta verificada • link oficial seguro</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-3 border-t border-zinc-800/50">
            <button
              onClick={() => onBuyClick(product)}
              className="w-full h-11 px-4 bg-[var(--wb-offer-button)] hover:brightness-95 text-[var(--wb-offer-button-text)] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wb-interface)]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ver oferta {platformBadge.prep} {platformBadge.label}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium rounded-xl border border-zinc-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartilhar</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onToggleFavorite(product.id)}
                className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                  isFavorite
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={isFavorite ? 'Remover dos salvos' : 'Salvar produto'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-400 text-rose-400' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
