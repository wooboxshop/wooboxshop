import React, { useState, useEffect } from 'react';
import { Product, StoreSettings } from '../types';
import { formatCurrency, calculateDiscount, getPlatformBadgeColor } from '../utils/helpers';
import { PlatformIcon } from './PlatformIcon';
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Check,
  Truck,
} from 'lucide-react';

interface FeaturedProductsBannerProps {
  products: Product[];
  onClickProduct: (product: Product) => void;
  onBuyClick: (product: Product, e: React.MouseEvent) => void;
  favorites?: string[];
  onToggleFavorite?: (id: string, e: React.MouseEvent) => void;
  storeSettings?: StoreSettings;
}

export const FeaturedProductsBanner: React.FC<FeaturedProductsBannerProps> = ({
  products,
  onClickProduct,
  onBuyClick,
  favorites = [],
  onToggleFavorite,
}) => {
  const featuredList = React.useMemo(() => {
    const active = products.filter((p) => p.isActive);
    const explicitlyFeatured = active.filter((p) => p.isFeatured);
    if (explicitlyFeatured.length > 0) return explicitlyFeatured;
    return active.slice(0, 4);
  }, [products]);

  const AUTOPLAY_INTERVAL_MS = 8000;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeProduct = featuredList[currentIndex] || featuredList[0];

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: activeProduct.title,
        text: `Confira este produto: ${activeProduct.title}`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  useEffect(() => {
    if (featuredList.length <= 1 || isPaused) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => {
      clearInterval(timer);
    };
  }, [featuredList.length, isPaused, currentIndex]);

  if (!activeProduct) {
    return null;
  }

  const discount = calculateDiscount(activeProduct.price, activeProduct.originalPrice);
  const isFavorite = favorites.includes(activeProduct.id);
  const platformLabel = getPlatformBadgeColor(activeProduct.platform).label;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % featuredList.length);
  };

  return (
    <article
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full rounded-2xl bg-[#111116] ring-1 ring-white/[0.07] overflow-hidden group"
    >
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.88fr)_minmax(420px,1.12fr)] min-h-0 md:min-h-[360px]">
        <div className="order-2 md:order-1 p-3.5 sm:p-6 lg:p-7 flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2 mb-2 sm:mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--wb-interface-light)]">Destaques da semana</span>
            {featuredList.length > 1 && (
              <span className="text-[10px] text-zinc-500">{currentIndex + 1} de {featuredList.length}</span>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-2 text-[11px] text-zinc-400 mb-1.5 sm:mb-2.5">
            <span className="inline-flex items-center gap-1.5 text-zinc-200 font-medium">
              <PlatformIcon platform={activeProduct.platform} className="w-4 h-4" />
              {platformLabel}
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="capitalize">{activeProduct.category}</span>
          </div>

          <h2
            onClick={() => onClickProduct(activeProduct)}
            className="text-base sm:text-2xl lg:text-[28px] font-bold text-white tracking-tight leading-snug sm:leading-[1.15] line-clamp-2 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            {activeProduct.title}
          </h2>

          <p className="hidden md:block mt-3 text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed max-w-lg">
            {activeProduct.description || 'Produto selecionado com excelente avaliação e custo-benefício.'}
          </p>

          {activeProduct.hasFreeShipping && (
            <div className="mt-2 sm:mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--wb-positive)]">
              <Truck className="w-3.5 h-3.5" />
              <span>Frete grátis disponível</span>
            </div>
          )}

          <div className="mt-3 sm:mt-5 flex items-end gap-2.5 flex-wrap">
            <span className="text-xl sm:text-[28px] font-bold text-white tracking-tight">
              {formatCurrency(activeProduct.price)}
            </span>
            {activeProduct.originalPrice && activeProduct.originalPrice > activeProduct.price && (
              <span className="pb-0.5 sm:pb-1 text-xs text-zinc-500 line-through">
                {formatCurrency(activeProduct.originalPrice)}
              </span>
            )}
            {discount > 0 && (
              <span className="mb-0.5 px-2 py-0.5 sm:py-1 rounded-lg bg-[var(--wb-positive)]/10 text-[var(--wb-positive)] ring-1 ring-[var(--wb-positive)]/20 text-[10px] sm:text-[11px] font-bold">
                -{discount}%
              </span>
            )}
          </div>

          <div className="mt-3.5 sm:mt-5 flex items-center gap-2 w-full">
            <button
              onClick={(event) => onBuyClick(activeProduct, event)}
              className="flex-1 sm:flex-none h-11 px-5 bg-[var(--wb-offer-button)] hover:brightness-95 text-[var(--wb-offer-button-text)] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span className="min-[360px]:hidden">Ver oferta</span>
              <span className="hidden min-[360px]:inline">Ver na {platformLabel}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleShare}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors cursor-pointer text-zinc-400 hover:text-white hover:bg-white/[0.05]"
              title="Compartilhar produto"
              aria-label="Compartilhar produto"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            {onToggleFavorite && (
              <button
                onClick={(event) => onToggleFavorite(activeProduct.id, event)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isFavorite
                    ? 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/25'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
                title={isFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          {featuredList.length > 1 && (
            <div className="flex items-center gap-1.5 mt-6">
              {featuredList.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1 rounded-full transition-all cursor-pointer ${
                    currentIndex === index ? 'w-6 bg-[var(--wb-interface)]' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                  }`}
                  title={item.title}
                  aria-label={`Ver destaque ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="order-1 md:order-2 relative min-h-[230px] sm:min-h-[300px] md:min-h-[360px] overflow-hidden bg-zinc-950">
          <div
            onClick={() => onClickProduct(activeProduct)}
            className="absolute inset-0 cursor-pointer group/img"
          >
            <img
              key={activeProduct.id}
              src={activeProduct.imageUrl}
              alt={activeProduct.title}
              className="w-full h-full object-cover group-hover/img:scale-[1.035] transition-transform duration-200 ease-out"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#111116] to-transparent hidden md:block" />
          </div>

          {discount > 0 && (
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[var(--wb-positive)] ring-1 ring-[var(--wb-positive)]/25 font-bold text-[11px]">
              -{discount}%
            </div>
          )}

          {featuredList.length > 1 && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                className="w-9 h-9 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-zinc-200 ring-1 ring-white/10 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Destaque anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="w-9 h-9 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-zinc-200 ring-1 ring-white/10 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Próximo destaque"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
