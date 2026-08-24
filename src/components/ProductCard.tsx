import React, { useState } from 'react';
import { Product } from '../types';
import { formatCurrency, calculateDiscount } from '../utils/helpers';
import { PlatformIcon } from './PlatformIcon';
import {
  ExternalLink,
  Star,
  Share2,
  Check,
  Heart,
  Sparkles,
  Truck,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClickProduct: (product: Product) => void;
  onBuyClick: (product: Product, e: React.MouseEvent) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, e: React.MouseEvent) => void;
  onShareClick?: (product: Product, e: React.MouseEvent) => void;
  rankIndex?: number;
  activeTab?: string;
  variant?: 'featured' | 'standard' | 'compact';
}

const ProductCardComponent: React.FC<ProductCardProps> = ({
  product,
  onClickProduct,
  onBuyClick,
  isFavorite = false,
  onToggleFavorite,
  onShareClick,
  rankIndex,
  variant = 'standard',
}) => {
  const [copied, setCopied] = useState(false);
  const discount = calculateDiscount(product.price, product.originalPrice);

  const platformLabel: Record<string, string> = {
    shopee: 'Shopee',
    mercadolivre: 'Mercado Livre',
    tiktok: 'TikTok Shop',
    amazon: 'Amazon',
    aliexpress: 'AliExpress',
  };

  const ctaLabel = platformLabel[product.platform]
    ? `Ver na ${platformLabel[product.platform]}`
    : 'Ver oferta';

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShareClick) {
      onShareClick(product, e);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(product.affiliateUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Compact Variant (used on mobile / list views)
  if (variant === 'compact') {
    return (
      <div
        onClick={() => onClickProduct(product)}
        className="group relative h-[140px] w-full min-w-0 bg-[#111116] border border-zinc-800/70 hover:border-zinc-700/80 overflow-hidden cursor-pointer rounded-xl grid grid-cols-[35%_minmax(0,1fr)] transition-colors duration-200"
      >
        <div className="relative h-full min-w-0 overflow-hidden bg-zinc-950">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-2 left-2 rounded-lg backdrop-blur-md bg-black/60 p-1 border border-white/10">
            <PlatformIcon platform={product.platform} className="w-4 h-4" />
          </div>
        </div>

        <div className="min-w-0 h-full p-3 flex flex-col justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span className="capitalize truncate font-medium">{product.category}</span>
              {product.rating > 0 && (
                <span className="flex items-center gap-0.5 text-zinc-300 font-semibold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {product.rating.toFixed(1)}
                </span>
              )}
            </div>
            <h3 className="text-xs font-semibold leading-snug text-zinc-200 group-hover:text-white line-clamp-2">
              {product.title}
            </h3>
            {product.hasFreeShipping && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--wb-positive)]">
                <Truck className="w-3 h-3" /> Frete grátis
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-white">
                {formatCurrency(product.price)}
              </span>
              {discount > 0 && (
                <span className="text-[10px] text-[var(--wb-positive)] font-semibold">
                  -{discount}%
                </span>
              )}
            </div>

            <button
              onClick={(e) => onBuyClick(product, e)}
              className="h-7 px-3 bg-[var(--wb-offer-button)] hover:brightness-95 text-[var(--wb-offer-button-text)] text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <span>Ver</span>
              <ExternalLink className="w-3 h-3 opacity-65" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClickProduct(product)}
      className="group relative h-full min-w-0 bg-[#111116] border border-zinc-800/60 hover:border-[var(--wb-interface)]/25 transition-all duration-200 hover:-translate-y-0.5 flex flex-col overflow-hidden cursor-pointer rounded-2xl shadow-[0_10px_32px_rgba(0,0,0,0.14)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.24)]"
    >
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden bg-zinc-950">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-[1.035] transition-transform duration-200 ease-out"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />

        {/* Top Badges: Platform (Left) & Optional Ranking (Right) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-10 pointer-events-none">
          <div className="shrink-0 rounded-lg backdrop-blur-md bg-black/60 p-1 border border-white/10">
            <PlatformIcon platform={product.platform} className="w-5 h-5 shrink-0" />
          </div>

          {product.isFeatured ? (
            <span className="h-7 px-2.5 rounded-lg text-[10px] font-bold bg-cyan-50 text-zinc-950 shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Escolha Woobox
            </span>
          ) : rankIndex !== undefined && rankIndex > 0 && rankIndex <= 3 ? (
            <span className="h-7 px-2.5 rounded-lg text-[10px] font-bold bg-black/75 backdrop-blur-md text-amber-300 border border-amber-500/25 flex items-center">
              #{rankIndex} Mais vendido
            </span>
          ) : product.badge ? (
            <span className="h-7 px-2.5 rounded-lg text-[10px] font-semibold bg-black/75 backdrop-blur-md text-zinc-200 border border-white/10 flex items-center">
              {product.badge}
            </span>
          ) : null}
        </div>

        {onToggleFavorite && (
          <button
            onClick={(e) => onToggleFavorite(product.id, e)}
            className={`absolute right-2.5 bottom-2.5 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-md border transition-all duration-200 cursor-pointer ${
              isFavorite
                ? 'bg-rose-500 text-white border-rose-300/25 scale-105'
                : 'bg-black/65 text-zinc-200 border-white/10 hover:bg-black/85 hover:text-white'
            }`}
            title={isFavorite ? 'Remover dos salvos' : 'Salvar produto'}
            aria-label={isFavorite ? 'Remover dos salvos' : 'Salvar produto'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between bg-[#111116] gap-5">
        <div className="space-y-2">
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-3 text-[11px] text-zinc-400">
            <span className="truncate font-medium capitalize tracking-wide">
              {product.category}
            </span>
            {product.rating > 0 && (
              <div className="flex items-center gap-1 text-zinc-200 font-semibold shrink-0 text-[11px]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-zinc-400 font-normal">({product.reviewsCount})</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-[15px] font-semibold text-zinc-100 group-hover:text-white transition-colors leading-snug line-clamp-2 min-h-[2.6rem]">
            {product.title}
          </h3>

          {product.hasFreeShipping && (
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--wb-positive)]">
              <Truck className="w-3.5 h-3.5" />
              <span>Frete grátis</span>
            </div>
          )}
        </div>

        {/* Pricing Area */}
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xl sm:text-[22px] font-bold text-white tracking-tight">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-zinc-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
              </div>
            </div>

            {discount > 0 && (
              <span className="h-7 px-2 rounded-lg bg-[var(--wb-positive)]/10 text-[var(--wb-positive)] border border-[var(--wb-positive)]/20 text-[11px] font-bold flex items-center shrink-0">
                -{discount}%
              </span>
            )}
          </div>

          {/* Action Button Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onBuyClick(product, e)}
              className="flex-1 h-11 px-3 bg-[var(--wb-offer-button)] hover:brightness-95 active:brightness-90 text-[var(--wb-offer-button-text)] text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wb-interface)]"
            >
              <span>{ctaLabel}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-65" />
            </button>

            <button
              onClick={handleShare}
              className="w-11 h-11 shrink-0 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800/70 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
              title="Compartilhar"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductCard = React.memo(ProductCardComponent);
