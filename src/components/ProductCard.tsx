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

  const ctaLabel = 'Ver produto';

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

  // Medals styling for top 3
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="h-5 sm:h-6 px-1.5 sm:px-2 rounded-md text-[9px] sm:text-[10px] font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 shadow-[0_2px_8px_rgba(245,158,11,0.4)] flex items-center border border-yellow-300">
          #1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="h-5 sm:h-6 px-1.5 sm:px-2 rounded-md text-[9px] sm:text-[10px] font-black bg-gradient-to-r from-slate-200 via-zinc-100 to-slate-300 text-zinc-950 shadow-[0_2px_8px_rgba(226,232,240,0.3)] flex items-center border border-white">
          #2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="h-5 sm:h-6 px-1.5 sm:px-2 rounded-md text-[9px] sm:text-[10px] font-black bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-amber-50 shadow-[0_2px_8px_rgba(180,83,9,0.35)] flex items-center border border-amber-500/70">
          #3
        </span>
      );
    }
    return (
      <span className="h-5 sm:h-6 px-1.5 sm:px-2 rounded-md text-[9px] sm:text-[10px] font-bold bg-black/75 backdrop-blur-md text-zinc-300 border border-white/10 flex items-center">
        #{rank}
      </span>
    );
  };

  return (
    <div
      onClick={() => onClickProduct(product)}
      className="group relative w-full h-full min-w-0 max-w-full bg-[#111116] border border-zinc-800/60 hover:border-[var(--wb-interface)]/25 transition-all duration-200 hover:-translate-y-0.5 flex flex-col overflow-hidden cursor-pointer rounded-xl sm:rounded-2xl shadow-[0_10px_32px_rgba(0,0,0,0.14)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.24)]"
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-950 shrink-0">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-[1.035] transition-transform duration-200 ease-out"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />

        {/* Top Badges: Platform (Left) & Optional Ranking (Right) */}
        <div className="absolute top-1.5 left-1.5 right-1.5 sm:top-2.5 sm:left-2.5 sm:right-2.5 flex items-center justify-between gap-1 z-10 pointer-events-none">
          <div className="shrink-0 drop-shadow-md">
            <PlatformIcon platform={product.platform} className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-md" />
          </div>

          {product.isFeatured ? (
            <span className="h-5 sm:h-6 px-1.5 sm:px-2 rounded-md text-[9px] sm:text-[10px] font-bold bg-cyan-50 text-zinc-950 shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="hidden xs:inline">Destaque</span>
            </span>
          ) : rankIndex !== undefined && rankIndex > 0 ? (
            getRankBadge(rankIndex)
          ) : null}
        </div>

        {onToggleFavorite && (
          <button
            onClick={(e) => onToggleFavorite(product.id, e)}
            className={`absolute right-1.5 bottom-1.5 sm:right-2.5 sm:bottom-2.5 w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-md border transition-all duration-200 cursor-pointer ${
              isFavorite
                ? 'bg-rose-500 text-white border-rose-300/25 scale-105'
                : 'bg-black/65 text-zinc-200 border-white/10 hover:bg-black/85 hover:text-white'
            }`}
            title={isFavorite ? 'Remover dos salvos' : 'Salvar produto'}
            aria-label={isFavorite ? 'Remover dos salvos' : 'Salvar produto'}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="p-2 sm:p-3.5 flex-1 flex flex-col justify-between bg-[#111116] gap-2 min-w-0">
        <div className="space-y-1 min-w-0">
          {/* Title */}
          <h3 className="text-xs sm:text-[14px] font-semibold text-zinc-100 group-hover:text-white transition-colors leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.4rem]">
            {product.title}
          </h3>

          {product.hasFreeShipping && (
            <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[var(--wb-positive)]">
              <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Frete grátis</span>
            </div>
          )}
        </div>

        {/* Pricing Area */}
        <div className="space-y-1.5 min-w-0">
          <div className="min-w-0">
            {product.originalPrice && product.originalPrice > product.price ? (
              <div className="text-[10px] sm:text-xs text-zinc-500 line-through leading-tight">
                {formatCurrency(product.originalPrice)}
              </div>
            ) : (
              <div className="text-[10px] sm:text-xs text-transparent select-none leading-tight">
                &nbsp;
              </div>
            )}

            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-sm sm:text-lg lg:text-xl font-bold text-white tracking-tight leading-tight">
                {formatCurrency(product.price)}
              </span>
              {discount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-[var(--wb-positive)]/10 text-[var(--wb-positive)] border border-[var(--wb-positive)]/20 text-[9px] sm:text-[10px] font-bold leading-none shrink-0">
                  -{discount}%
                </span>
              )}
            </div>
          </div>

          {/* Action Button Row */}
          <div className="flex items-center gap-1.5 w-full min-w-0 pt-0.5">
            <button
              onClick={(e) => onBuyClick(product, e)}
              className="flex-1 min-w-0 h-7.5 sm:h-9 px-1.5 sm:px-2.5 bg-[var(--wb-offer-button)] hover:brightness-95 active:brightness-90 text-[var(--wb-offer-button-text)] text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wb-interface)]"
            >
              <span className="truncate">{ctaLabel}</span>
              <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-70 shrink-0" />
            </button>

            <button
              onClick={handleShare}
              className="w-7.5 h-7.5 sm:w-9 sm:h-9 shrink-0 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800/70 rounded-lg sm:rounded-xl transition-colors cursor-pointer flex items-center justify-center"
              title="Compartilhar"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductCard = React.memo(ProductCardComponent);
