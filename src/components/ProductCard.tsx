import React from 'react';
import { Product } from '../types';
import { formatCurrency, calculateDiscount, getPlatformBadgeColor } from '../utils/helpers';
import {
  ExternalLink,
  Heart,
  Star,
  Flame,
  Share2,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Check,
  ShoppingBag,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClickProduct: (product: Product) => void;
  onBuyClick: (product: Product, e: React.MouseEvent) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onShareClick?: (product: Product, e: React.MouseEvent) => void;
  isAdmin?: boolean;
  onEditProduct?: (product: Product, e: React.MouseEvent) => void;
  onDeleteProduct?: (id: string, e: React.MouseEvent) => void;
  onToggleActiveProduct?: (product: Product, e: React.MouseEvent) => void;
  rankIndex?: number;
  activeTab?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClickProduct,
  onBuyClick,
  isFavorite,
  onToggleFavorite,
  onShareClick,
  isAdmin,
  onEditProduct,
  onDeleteProduct,
  onToggleActiveProduct,
  rankIndex,
  activeTab,
}) => {
  const [copied, setCopied] = React.useState(false);
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
      className={`group relative bg-[#0d0c15]/90 border transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden cursor-pointer rounded-2xl shadow-lg ${
        !product.isActive
          ? 'opacity-60 border-amber-500/40 bg-amber-950/20'
          : product.isFeatured
          ? 'border-pink-500/60 shadow-pink-500/10 hover:border-pink-500 hover:shadow-pink-500/20'
          : 'border-zinc-800/80 hover:border-pink-500/40'
      }`}
    >
      {/* Product Image Box */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#0d0c15] isolate">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out transform-gpu [backface-visibility:hidden]"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />

        {/* Gradient Overlay for badges legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0c15] via-transparent to-black/40 opacity-90 pointer-events-none" />

        {/* Top Badges Row */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          {/* Platform Tag */}
          <span
            className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shadow-md ${platformBadge.bg} ${platformBadge.text}`}
          >
            {platformBadge.label}
          </span>

          {/* Favorite Button */}
          <button
            onClick={(e) => onToggleFavorite(product.id, e)}
            className={`p-2 rounded-full transition-transform active:scale-90 ${
              isFavorite
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-zinc-950/90 hover:bg-zinc-800 text-zinc-300 hover:text-rose-400 border border-zinc-700/60'
            }`}
            title={isFavorite ? 'Remover dos salvos' : 'Salvar produto'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Ranking Badge overlay for 'Mais Vendidos' tab (strictly Top 3) */}
        {rankIndex !== undefined && rankIndex > 0 && rankIndex <= 3 && (
          <div className="absolute top-12 left-3 z-10">
            <span
              className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 border ${
                rankIndex === 1
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-zinc-950 border-amber-300 ring-2 ring-amber-400/50'
                  : rankIndex === 2
                  ? 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 text-zinc-950 border-slate-200 ring-2 ring-slate-300/40'
                  : 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-amber-100 border-amber-500 ring-2 ring-amber-600/40'
              }`}
            >
              <Trophy className="w-3 h-3 text-amber-300" />
              {rankIndex === 1 && '1º MAIS VENDIDO'}
              {rankIndex === 2 && '2º MAIS VENDIDO'}
              {rankIndex === 3 && '3º MAIS VENDIDO'}
            </span>
          </div>
        )}

        {/* Featured / Curated Badge overlay when product isFeatured and not in top 3 ranking */}
        {product.isFeatured && (!rankIndex || rankIndex > 3) && (
          <div className="absolute top-12 left-3 z-10">
            <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-lg border border-pink-400/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300" /> Destaque da Loja
            </span>
          </div>
        )}

        {/* Bottom Image Badges */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 z-10">
          <div className="flex flex-wrap items-center gap-1.5">
            {product.badge && (
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white text-[10px] font-black uppercase shadow-md">
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-black shadow-md">
                -{discount}% OFF
              </span>
            )}
          </div>

          {/* Clicks Counter */}
          <span className="px-2 py-0.5 rounded-full bg-zinc-950/90 border border-zinc-800 text-pink-400 text-[10px] font-bold flex items-center gap-1 shrink-0">
            <Flame className="w-3 h-3 text-pink-500 fill-pink-500" />
            {product.clicksCount || 0}
          </span>
        </div>

        {/* Inactive Admin Banner */}
        {!product.isActive && (
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-amber-500 text-zinc-950 font-black text-xs px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-lg flex items-center gap-1.5">
              <EyeOff className="w-4 h-4" /> Inativo
            </span>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#0d0c15] relative z-10 -mt-px">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-1.5">
            <span className="text-pink-400 font-extrabold text-[10px] uppercase tracking-wider">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-zinc-500 font-normal text-[10px]">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm text-white line-clamp-2 group-hover:text-pink-300 transition-colors leading-snug">
            {product.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-zinc-400 line-clamp-2 mt-1 font-normal leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Buy Button */}
        <div className="pt-2 border-t border-zinc-800/80 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-base sm:text-lg font-black text-white tracking-tight">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-zinc-500 line-through ml-2 font-medium">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onBuyClick(product, e)}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-md shadow-pink-500/20 flex items-center justify-center gap-1.5 transition-transform active:scale-95 group/btn"
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

          {/* Admin Controls */}
          {isAdmin && (
            <div className="pt-2 border-t border-dashed border-zinc-800 flex items-center justify-between text-xs bg-zinc-950/80 p-2 rounded-xl">
              <span className="font-bold text-zinc-500 text-[10px] uppercase">Admin</span>
              <div className="flex items-center gap-1.5">
                {onToggleActiveProduct && (
                  <button
                    onClick={(e) => onToggleActiveProduct(product, e)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      product.isActive
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border-amber-800'
                    }`}
                    title={product.isActive ? 'Desativar' : 'Ativar'}
                  >
                    {product.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                )}

                {onEditProduct && (
                  <button
                    onClick={(e) => onEditProduct(product, e)}
                    className="p-1.5 bg-blue-950 text-blue-400 border border-blue-800 rounded-lg hover:bg-blue-900 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {onDeleteProduct && (
                  <button
                    onClick={(e) => onDeleteProduct(product.id, e)}
                    className="p-1.5 bg-rose-950 text-rose-400 border border-rose-800 rounded-lg hover:bg-rose-900 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

