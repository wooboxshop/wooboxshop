import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FeaturedCarouselProps {
  products: Product[];
  orderedProducts: Product[];
  sortBy: string;
  favorites: string[];
  onClickProduct: (product: Product) => void;
  onBuyClick: (product: Product, e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onShareClick: (product: Product, e?: React.MouseEvent) => void;
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  products,
  orderedProducts,
  sortBy,
  favorites,
  onClickProduct,
  onBuyClick,
  onToggleFavorite,
  onShareClick,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(products.length > 1 ? 1 : 0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  useEffect(() => {
    setActiveIndex(0);
    setTransitionEnabled(false);
    setTrackIndex(products.length > 1 ? 1 : 0);
    const frame = requestAnimationFrame(() => setTransitionEnabled(true));
    return () => cancelAnimationFrame(frame);
  }, [products]);

  if (products.length === 0) return null;

  const goTo = (index: number) => {
    if (products.length <= 1) return;
    const nextIndex = (index + products.length) % products.length;
    setActiveIndex(nextIndex);
    setTransitionEnabled(true);
    setTrackIndex(nextIndex + 1);
  };

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || products.length <= 1) return;

    if (trackIndex === 0) {
      setTransitionEnabled(false);
      setTrackIndex(products.length);
      requestAnimationFrame(() => setTransitionEnabled(true));
    } else if (trackIndex === products.length + 1) {
      setTransitionEnabled(false);
      setTrackIndex(1);
      requestAnimationFrame(() => setTransitionEnabled(true));
    }
  };

  const carouselProducts = products.length > 1
    ? [products[products.length - 1], ...products, products[0]]
    : products;

  return (
    <div className="featured-carousel-shell w-full max-w-[1040px] mx-auto">
      <div className="overflow-hidden rounded-3xl">
        <div
          className={`flex items-stretch will-change-transform ${transitionEnabled ? 'transition-transform duration-500 ease-out' : ''}`}
          style={{ transform: `translate3d(-${trackIndex * 100}%, 0, 0)` }}
          onTransitionEnd={handleTransitionEnd}
          aria-live="polite"
        >
          {carouselProducts.map((product, index) => (
            <div key={`${product.id}-${index}`} className="w-full min-w-full shrink-0 px-0.5 sm:px-1">
              <ProductCard
                product={product}
                variant="featured"
                rankIndex={sortBy === 'populares' ? orderedProducts.indexOf(product) + 1 : undefined}
                onClickProduct={onClickProduct}
                onBuyClick={onBuyClick}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={onToggleFavorite}
                onShareClick={onShareClick}
              />
            </div>
          ))}
        </div>
      </div>

      {products.length > 1 && (
        <div className="flex items-center justify-center gap-3 pt-3.5">
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/90 text-zinc-300 transition-all hover:border-[var(--wb-primary)]/70 hover:text-white hover:bg-zinc-800 cursor-pointer shadow-sm"
            aria-label="Produto anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5" aria-label={`Produto ${activeIndex + 1} de ${products.length}`}>
            {products.map((product, index) => (
              <button
                key={product.id}
                type="button"
                onClick={() => goTo(index)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeIndex === index ? 'w-7 bg-[var(--wb-primary)] shadow-sm' : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                }`}
                aria-label={`Ver destaque ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/90 text-zinc-300 transition-all hover:border-[var(--wb-primary)]/70 hover:text-white hover:bg-zinc-800 cursor-pointer shadow-sm"
            aria-label="Próximo produto"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
