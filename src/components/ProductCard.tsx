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
}

const ProductCardComponent: React.FC<ProductCardProps> = ({
  product,
  onClickProduct,
  onBuyClick,
  onShareClick,
  rankIndex,
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

  return (
    <div
      onClick={() => onClickProduct(product)}
      className={`group relative bg-[#0d0c15]/95 border transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden cursor-pointer rounded-2xl shadow-md ${
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
      <div className="relative aspect-square w-full overflow-hidden bg-[#0d0c15] isolate">
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
      <div className="p-4 pt-3.5 flex-1 flex flex-col justify-between space-y-4 bg-[#0d0c15] relative z-10 -mt-px">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-2">
            <span className="text-[var(--wb-primary-light)] font-bold text-[8px] uppercase tracking-[0.08em]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-zinc-500 font-normal text-[10px]">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm text-zinc-100 line-clamp-2 group-hover:text-[var(--wb-primary-light)] transition-colors leading-snug">
            {product.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5 font-normal leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Buy Button */}
        <div className="pt-3 border-t border-zinc-800/80 space-y-3">
          <div className="flex flex-col justify-end min-h-[38px]">
            {product.originalPrice && product.originalPrice > product.price ? (
              <span className="text-[11px] text-zinc-400 line-through font-medium leading-tight">
                {formatCurrency(product.originalPrice)}
              </span>
            ) : (
              <span className="text-[11px] opacity-0 leading-tight select-none pointer-events-none">
                &nbsp;
              </span>
            )}
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-base sm:text-lg font-black text-white tracking-tight leading-none">
                {formatCurrency(product.price)}
              </span>
              {discount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-zinc-950 text-[10px] font-black shadow-sm shrink-0 whitespace-nowrap">
                  -{discount}% OFF
                </span>
              )}
            </div>
            {product.hasFreeShipping && (
              <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold mt-1">
                <Truck className="w-3 h-3 shrink-0" />
                <span>Frete grátis</span>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onBuyClick(product, e)}
              className="flex-1 py-2.5 px-3 bg-[var(--wb-primary)] hover:brightness-110 text-white text-xs font-black rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95 group/btn"
            >
              <ShoppingBag className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
              <span>Comprar</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </button>

            {/* Share Link Button */}
            <button
              onClick={handleShare}
              className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl transition-colors cursor-pointer"
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
