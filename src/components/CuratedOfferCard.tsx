import React from 'react';
import { Product } from '../types';
import { Star, ExternalLink, ChevronRight } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';

interface CuratedOfferCardProps {
  product: Product;
  onClickProduct: (product: Product) => void;
  onBuyClick: (product: Product, e: React.MouseEvent) => void;
  onViewAll?: () => void;
}

export const CuratedOfferCard: React.FC<CuratedOfferCardProps> = ({
  product,
  onClickProduct,
  onBuyClick,
  onViewAll,
}) => {
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="bg-[#111116] rounded-2xl p-5 border border-zinc-800/70 shadow-lg flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/50 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Escolha da Semana
        </span>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-0.5 transition-colors cursor-pointer"
          >
            <span>Ver todas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex flex-col flex-1 justify-between gap-3">
        {/* Product Image */}
        <div
          onClick={() => onClickProduct(product)}
          className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/60 cursor-pointer group"
        >
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />

          <div className="absolute top-2 left-2 rounded-lg backdrop-blur-md bg-black/60 p-1 border border-white/10">
            <PlatformIcon platform={product.platform} className="w-4 h-4" />
          </div>

          {discountPercent > 0 && (
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-emerald-400 border border-emerald-500/30 font-semibold text-[11px]">
              -{discountPercent}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-medium capitalize">
              {product.category}
            </span>

            {product.rating > 0 && (
              <div className="flex items-center gap-1 text-zinc-300">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <h4
            onClick={() => onClickProduct(product)}
            className="text-xs sm:text-sm font-semibold text-white line-clamp-2 hover:text-zinc-300 transition-colors cursor-pointer leading-snug"
          >
            {product.title}
          </h4>

          {/* Price Box */}
          <div className="pt-1 flex items-baseline gap-2">
            <span className="text-base font-bold text-white">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-zinc-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => onBuyClick(product, e)}
          className="w-full mt-1 py-2 px-3 bg-[var(--wb-offer-button)] hover:brightness-95 text-[var(--wb-offer-button-text)] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Ver oferta</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-65" />
        </button>
      </div>

      {/* Mobile Layout */}
      <div className="flex sm:hidden items-center gap-3">
        <div
          onClick={() => onClickProduct(product)}
          className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/60 cursor-pointer"
        >
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between h-24 py-0.5">
          <div>
            <span className="text-[10px] text-zinc-500 font-medium capitalize truncate block">
              {product.category}
            </span>
            <h4
              onClick={() => onClickProduct(product)}
              className="text-xs font-semibold text-white line-clamp-2 leading-tight mt-0.5"
            >
              {product.title}
            </h4>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-white">
                {formatPrice(product.price)}
              </span>
              {discountPercent > 0 && (
                <span className="text-[10px] text-emerald-400 font-semibold">
                  -{discountPercent}%
                </span>
              )}
            </div>

            <button
              onClick={(e) => onBuyClick(product, e)}
              className="w-full mt-1 py-1 px-2.5 bg-[var(--wb-offer-button)] hover:brightness-95 text-[var(--wb-offer-button-text)] font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 transition-all"
            >
              <span>Ver oferta</span>
              <ExternalLink className="w-3 h-3 opacity-65" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
