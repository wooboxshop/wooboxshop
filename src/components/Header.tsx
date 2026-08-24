import React, { useState } from 'react';
import {
  Search,
  Heart,
  Menu,
  Instagram,
  X,
  Home,
  Tag,
  Trophy,
  Sparkles,
  ChevronRight,
  LayoutGrid,
  ChevronDown,
} from 'lucide-react';
import { CategoryOption, PlatformType, StoreSettings, DEFAULT_STORE_SETTINGS } from '../types';
import { PlatformIcon } from './PlatformIcon';
import { PriceRangeFilter, PriceRangeValue } from './PriceRangeFilter';
import { STORE_PLATFORMS } from '../utils/platforms';
import { renderCategoryIcon } from '../utils/categoryIcons';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  favoritesCount: number;
  onToggleFavoritesOnly: () => void;
  showFavoritesOnly: boolean;
  onOpenFilterDrawer?: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  storeSettings?: StoreSettings;
  categories?: CategoryOption[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  selectedPlatform?: string | null;
  onSelectPlatform?: (platform: string | null) => void;
  availablePlatforms?: PlatformType[];
  priceBounds?: PriceRangeValue;
  priceRange?: PriceRangeValue;
  onPriceRangeChange?: (value: PriceRangeValue) => void;
  maxPriceLimit?: number;
  onPriceLimitChange?: (val: number) => void;
  minPossiblePrice?: number;
  maxPossiblePrice?: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  favoritesCount,
  onToggleFavoritesOnly,
  showFavoritesOnly,
  activeTab = 'inicio',
  onSelectTab,
  storeSettings = DEFAULT_STORE_SETTINGS,
  categories = [],
  selectedCategory = 'todos',
  onSelectCategory,
  selectedPlatform = null,
  onSelectPlatform,
  availablePlatforms = [],
  priceBounds,
  priceRange,
  onPriceRangeChange,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const storeName = storeSettings?.storeName || DEFAULT_STORE_SETTINGS.storeName;
  const logoUrl = storeSettings?.logoUrl || DEFAULT_STORE_SETTINGS.logoUrl;
  const storeNameParts = storeName.match(/^(.*?)(\s+shop)$/i);
  const renderedStoreName = storeNameParts ? (
    <>
      <span>{storeNameParts[1]}</span>
      <span className="text-[var(--wb-interface)]">{storeNameParts[2]}</span>
    </>
  ) : storeName;

  const handleNavClick = (tabKey: string) => {
    if (onSelectTab) {
      onSelectTab(tabKey);
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (onSelectTab) {
      onSelectTab('inicio');
    }
    if (onSearchChange) {
      onSearchChange('');
    }
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0c0c10]/95 backdrop-blur-md border-b border-zinc-800/50 text-white transition-colors">
        <div className="max-w-[1480px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2.5 sm:gap-4">
            
            {/* Mobile Menu Icon */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-9 h-9 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/60 lg:hidden transition-colors cursor-pointer border border-zinc-800/70 flex items-center justify-center shrink-0"
              aria-label="Abrir Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink group cursor-pointer text-left focus-visible:outline-none"
            >
              <img
                src={logoUrl}
                alt={storeName}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover shrink-0 group-hover:opacity-90 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <span className="text-white text-sm sm:text-base font-bold tracking-tight truncate group-hover:text-zinc-200 transition-colors">
                {renderedStoreName}
              </span>
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-auto relative hidden sm:block">
              <div className="relative w-full flex items-center">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-zinc-900 hover:bg-zinc-900/90 text-zinc-100 placeholder-zinc-500 rounded-xl border border-zinc-800 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all outline-none"
                />

                {searchQuery ? (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 p-0.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Limpar busca"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@woobox.shop"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors hidden md:flex"
                title="TikTok"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.65 6.34 6.34 0 0 0 9.35 22a6.33 6.33 0 0 0 6.32-6.33V9.17a8.16 8.16 0 0 0 3.92 1V6.69z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/wooboxshop/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors hidden md:flex"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>

              {/* Wishlist */}
              <button
                onClick={onToggleFavoritesOnly}
                className={`w-9 h-9 sm:w-auto sm:px-3 sm:py-1.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  showFavoritesOnly
                    ? 'bg-[var(--wb-interface)]/10 border-[var(--wb-interface)]/30 text-[var(--wb-interface-light)]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title="Salvos"
              >
                <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-rose-400 text-rose-400' : ''}`} />
                <span className="hidden sm:inline">Salvos</span>
                {favoritesCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                    {favoritesCount}
                  </span>
                )}
              </button>
            </div>

          </div>

          {/* Mobile Search input */}
          <div className="sm:hidden pt-2">
            <div className="relative w-full flex items-center">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full h-9 pl-9 pr-8 text-xs bg-zinc-900/85 text-zinc-100 placeholder-zinc-500 rounded-xl border border-zinc-800/80 focus:border-[var(--wb-interface)]/50 transition-all outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 p-0.5 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in transition-opacity"
          />

          <div className="relative w-[min(88vw,320px)] bg-[#0c0c10] border-r border-zinc-800/60 h-full overflow-y-auto p-4 shadow-xl z-10 custom-scrollbar">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <button
                  onClick={handleLogoClick}
                  className="flex items-center gap-2.5 text-left cursor-pointer group hover:opacity-90 transition-opacity focus-visible:outline-none"
                >
                  <img
                    src={logoUrl}
                    alt={storeName}
                    className="w-8 h-8 rounded-lg object-cover bg-transparent shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-white text-base font-bold truncate">
                    {renderedStoreName}
                  </span>
                </button>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 rounded-lg border border-zinc-800 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase text-zinc-500 tracking-wider block px-2 mb-2">
                  Menu
                </span>

                <nav className="space-y-1">
                  <button
                    onClick={() => handleNavClick('inicio')}
                    className={`w-full p-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      activeTab === 'inicio' && !showFavoritesOnly
                        ? 'bg-white/[0.07] text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Home className="w-4 h-4" />
                      <span>Início</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </button>

                  <button
                    onClick={() => handleNavClick('ofertas')}
                    className={`w-full p-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      activeTab === 'ofertas'
                        ? 'bg-white/[0.07] text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Tag className="w-4 h-4" />
                      <span>Ofertas</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </button>

                  <button
                    onClick={() => handleNavClick('novidades')}
                    className={`w-full p-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      activeTab === 'novidades'
                        ? 'bg-white/[0.07] text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4" />
                      <span>Novidades</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </button>
                </nav>
              </div>

              {priceBounds && priceRange && onPriceRangeChange && (
                <details className="group border-t border-zinc-800/60 pt-3">
                  <summary className="list-none px-2 py-2 flex items-center justify-between text-[11px] font-semibold uppercase text-zinc-500 tracking-wider cursor-pointer">
                    Preço
                    <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <PriceRangeFilter
                    bounds={priceBounds}
                    value={priceRange}
                    onChange={onPriceRangeChange}
                    compact
                  />
                </details>
              )}

              <details className="group border-t border-zinc-800/60 pt-3" open>
                <summary className="list-none px-2 py-2 flex items-center justify-between text-[11px] font-semibold uppercase text-zinc-500 tracking-wider cursor-pointer">
                  Categorias
                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="space-y-1 mt-1">
                  {categories.map((category) => {
                    const isSelected = selectedCategory === category.id && !selectedPlatform;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          onSelectCategory?.(category.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                          isSelected ? 'bg-white/[0.07] text-white font-semibold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                        }`}
                      >
                        <span className={`shrink-0 ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                          {renderCategoryIcon(category.icon, 'w-4 h-4')}
                        </span>
                        <span className="truncate">{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </details>

              {availablePlatforms.length > 0 && (
                <details className="group border-t border-zinc-800/60 pt-3" open>
                  <summary className="list-none px-2 py-2 flex items-center justify-between text-[11px] font-semibold uppercase text-zinc-500 tracking-wider cursor-pointer">
                    Lojas
                    <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="space-y-1 mt-1">
                    {STORE_PLATFORMS.filter((store) => availablePlatforms.includes(store.id)).map((store) => (
                      <button
                        key={store.id}
                        onClick={() => {
                          onSelectPlatform?.(selectedPlatform === store.id ? null : store.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                          selectedPlatform === store.id ? 'bg-white/[0.07] text-white font-semibold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                        }`}
                      >
                        <PlatformIcon platform={store.id} className="w-4 h-4" />
                        <span>{store.label}</span>
                      </button>
                    ))}
                  </div>
                </details>
              )}

            <div className="pt-4 border-t border-zinc-800/60 flex items-center gap-2">
              <a
                href="https://www.tiktok.com/@woobox.shop"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1.5"
              >
                <span>TikTok</span>
              </a>
              <a
                href="https://www.instagram.com/wooboxshop/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1.5"
              >
                <span>Instagram</span>
              </a>
            </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
