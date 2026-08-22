import React, { useState } from 'react';
import { Product } from '../types';
import { formatCurrency, calculateDiscount, getPlatformBadgeColor } from '../utils/helpers';
import { PlatformIcon } from './PlatformIcon';
import {
  ExternalLink,
  Star,
  Flame,
  Share2,
  Check,
  ShoppingBag,
  Trophy,
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
  onShareClick,
  rankIndex,
  variant = 'standard',
}) => {
  const [copied, setCopied] = useState(false);
  const discount = calculateDiscount(product.price, product.originalPrice);
  const platformBadge = getPlatformBadgeColor(product.platform);

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

  if (variant === 'compact') {
    return (
      <div
        onClick={() => onClickProduct(product)}
        className={`group relative h-[178px] w-full min-w-0 bg-[#0d0c15] border border-zinc-800/80 hover:border-zinc-700 overflow-hidden cursor-pointer rounded-2xl shadow-sm grid grid-cols-[40%_minmax(0,1fr)] transition-colors ${
          rankIndex === 1 ? 'woobox-hot-glow' : ''
        }`}
      >
        <div className="relative h-full min-w-0 overflow-hidden bg-zinc-900 isolate">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25 pointer-events-none" />
          <div className="absolute top-2 left-2 shadow-md rounded-lg overflow-hidden">
            <PlatformIcon platform={product.platform} className="w-6 h-6" />
          </div>
          <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-full bg-zinc-950/85 border border-zinc-700/60 text-[8px] font-bold text-white flex items-center gap-1">
            <Flame className="w-2.5 h-2.5 text-[var(--wb-primary)] fill-[var(--wb-primary)]" />
            {product.clicksCount || 0}
          </span>
        </div>

        <div className="min-w-0 h-full p-3 flex flex-col">
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="min-w-0 truncate text-[8px] uppercase tracking-wide font-bold text-[var(--wb-primary-light)]">
                {product.category}
              </span>
              <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" /> {product.rating.toFixed(1)}
              </span>
            </div>
            <h3 className="min-h-[2.2rem] text-[13px] font-extrabold leading-snug text-white line-clamp-2">
              {product.title}
            </h3>
          </div>

          <div className="mt-auto space-y-2">
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="block text-[9px] text-zinc-500 line-through leading-none mb-1">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
                <span className="text-lg font-black text-white leading-none [font-variant-numeric:tabular-nums]">{formatCurrency(product.price)}</span>
              </div>
              {discount > 0 && (
                <span className="shrink-0 min-w-[48px] text-center px-1.5 py-0.5 rounded-md bg-emerald-500 text-zinc-950 text-[9px] font-black [font-variant-numeric:tabular-nums]">
                  -{discount}%
                </span>
              )}
            </div>

            <button
              onClick={(e) => onBuyClick(product, e)}
              className="w-full min-h-8 px-3 bg-[var(--wb-primary)] hover:brightness-110 text-white text-[11px] font-black rounded-lg flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98]"
            >
              Ver oferta <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isFeaturedCard = variant === 'featured';

  return (
    <div
      onClick={() => onClickProduct(product)}
      className={`group relative h-full min-w-0 bg-[#0d0c15]/95 border transition-all duration-300 hover:-translate-y-0.5 flex overflow-hidden cursor-pointer shadow-md ${
        isFeaturedCard ? 'flex-col sm:flex-row rounded-3xl' : 'flex-col rounded-2xl'
      } ${
        rankIndex === 1 ? 'woobox-hot-glow' : ''
      } ${
        !product.isActive
          ? 'opacity-60 border-amber-500/30 bg-amber-950/10'
          : product.isFeatured
          ? 'border-zinc-700/90 hover:border-[var(--wb-primary)]/35 hover:shadow-[var(--wb-primary)]/5'
          : 'border-zinc-800/80 hover:border-zinc-700'
      }`}
    >
      {/* Product Image Box */}
      <div className={`relative overflow-hidden bg-[#0d0c15] isolate ${
        isFeaturedCard
          ? 'aspect-[16/10] w-full sm:aspect-auto sm:w-[48%] sm:min-h-[320px] xl:min-h-[340px] shrink-0'
          : 'aspect-square w-full'
      }`}>
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out transform-gpu [backface-visibility:hidden]"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />

        {/* Gradient Overlay for badges legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0c15]/95 via-transparent to-black/30 opacity-75 pointer-events-none" />

        {/* Subtle vignette to unify photos with varied backgrounds/lighting */}
        <div className="absolute inset-0 shadow-[inset_0_0_28px_10px_rgba(5,5,8,0.28)] pointer-events-none" />

        {/* Top Badges Row: Store Platform Real Logo Badge & Ranking Badge */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-10 pointer-events-none">
          {/* Real Platform Logo */}
          <div className="shrink-0 shadow-lg rounded-lg overflow-hidden flex items-center justify-center" title={platformBadge.label}>
            <PlatformIcon platform={product.platform} className="w-7 h-7 shrink-0" />
          </div>

          {/* Ranking Badge overlay */}
          {rankIndex !== undefined && rankIndex > 0 && rankIndex <= 3 && (
            <span
              className={`px-2 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wide shadow-md flex items-center gap-1 border backdrop-blur-md shrink-0 whitespace-nowrap ${
                rankIndex === 1
                  ? 'bg-amber-400/95 text-zinc-950 border-amber-300/80'
                  : rankIndex === 2
                  ? 'bg-zinc-200/95 text-zinc-900 border-zinc-100/80'
                  : 'bg-amber-700/90 text-amber-50 border-amber-500/60'
              }`}
            >
              <Trophy className="w-3 h-3 text-amber-300 shrink-0" />
              {rankIndex === 1 && '1º MAIS VENDIDO'}
              {rankIndex === 2 && '2º MAIS VENDIDO'}
              {rankIndex === 3 && '3º MAIS VENDIDO'}
            </span>
          )}
        </div>

        {/* Bottom Right Image Badge: Clicks Counter */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="px-2 py-0.5 rounded-full bg-zinc-950/90 border border-zinc-700/60 text-white text-[9px] font-bold flex items-center gap-1 shrink-0 backdrop-blur-sm shadow-md">
            <Flame className="w-3 h-3 text-[var(--wb-primary)] fill-[var(--wb-primary)]" />
            {product.clicksCount === 1 ? '1 acesso' : `${product.clicksCount || 0} acessos`}
          </span>
        </div>
      </div>

      {/* Product Content */}
      <div className={`${isFeaturedCard ? 'p-4 sm:p-6 sm:justify-center' : 'p-4 pt-3.5'} flex-1 flex flex-col bg-[#0d0c15] relative z-10 -mt-px`}>
        <div className="min-w-0">
          {isFeaturedCard && (
            <span className="hidden sm:inline-flex mb-3 px-2.5 py-1 rounded-full bg-[var(--wb-primary)]/15 border border-[var(--wb-primary)]/30 text-[var(--wb-primary-light)] text-[9px] font-black uppercase tracking-wider">
              Escolha da curadoria
            </span>
          )}
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-3 text-xs text-zinc-400 font-medium mb-2">
            <span className="min-w-0 truncate text-[var(--wb-primary-light)] font-bold text-[9px] uppercase tracking-[0.08em]" title={product.category}>
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-bold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-zinc-500 font-normal text-[10px]">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className={`${isFeaturedCard ? 'text-lg sm:text-2xl line-clamp-3' : 'min-h-[2.4rem] text-sm line-clamp-2'} font-black text-zinc-100 group-hover:text-[var(--wb-primary-light)] transition-colors leading-tight`}>
            {product.title}
          </h3>

          {/* Description snippet */}
          {isFeaturedCard && (
            <p className="hidden sm:block text-sm text-zinc-400 line-clamp-3 mt-2.5 font-normal leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Pricing & Buy Button */}
        <div className={`${isFeaturedCard ? 'mt-3 sm:mt-5' : 'mt-3'} space-y-3`}>
          <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-950/55 border border-zinc-800/70 space-y-2">
            {/* Top row: Preço original riscado + Frete grátis (ou Economia se não tiver frete grátis) */}
            <div className="flex items-center justify-between gap-2 min-h-4">
              {product.originalPrice && product.originalPrice > product.price ? (
                <span className="text-[10px] text-zinc-500 line-through font-medium leading-tight [font-variant-numeric:tabular-nums]">
                  {formatCurrency(product.originalPrice)}
                </span>
              ) : (
                <span className="text-[10px] text-zinc-500 font-semibold leading-tight">
                  Preço especial
                </span>
              )}

              {product.hasFreeShipping ? (
                <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold whitespace-nowrap shrink-0">
                  <Truck className="w-3 h-3 shrink-0" />
                  <span>Frete grátis</span>
                </div>
              ) : product.originalPrice && product.originalPrice > product.price ? (
                <span className="text-[10px] text-emerald-400 font-bold whitespace-nowrap leading-tight shrink-0 [font-variant-numeric:tabular-nums]">
                  Economize {formatCurrency(product.originalPrice - product.price)}
                </span>
              ) : null}
            </div>

            {/* Bottom row: Preço atual em destaque + Badge de desconto */}
            <div className="flex items-end justify-between gap-3 min-h-6">
              <span className={`${isFeaturedCard ? 'text-2xl sm:text-3xl' : 'text-xl'} font-black text-white tracking-tight leading-none [font-variant-numeric:tabular-nums]`}>
                {formatCurrency(product.price)}
              </span>
              {discount > 0 && (
                <span className="min-w-[58px] text-center px-1.5 py-0.5 rounded-md bg-emerald-500 text-zinc-950 text-[10px] font-black shadow-sm whitespace-nowrap shrink-0 [font-variant-numeric:tabular-nums]">
                  -{discount}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onBuyClick(product, e)}
              className="flex-1 min-h-10 py-2.5 px-3 bg-[var(--wb-primary)] hover:brightness-110 text-white text-xs font-black rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95 group/btn"
            >
              <ShoppingBag className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
              <span>{isFeaturedCard ? 'Ver oferta em destaque' : 'Ver oferta'}</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </button>

            {/* Share Link Button */}
            <button
              onClick={handleShare}
              className="w-10 h-10 shrink-0 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
              title="Compartilhar produto"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoized: with dozens of cards rendered at once, an unmemoized ProductCard re-runs
// its full render for every card whenever ANY app state changes (e.g. opening another
// product's detail modal), which is the main cause of jank on mobile/tablet. Since the
// callback props passed down from App are now stable (useCallback) and `product` only
// gets a new object reference when that specific product actually changes, this lets
// React skip re-rendering cards that aren't affected by a given state update.
export const ProductCard = React.memo(ProductCardComponent);
