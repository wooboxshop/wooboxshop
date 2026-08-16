import React, { useState } from 'react';
import { PriceSlider } from './PriceSlider';
import {
  Search,
  ShieldCheck,
  Heart,
  Menu,
  Instagram,
  X,
  Home,
  Flame,
  Trophy,
  Sparkles,
  Tag,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { StoreSettings, DEFAULT_STORE_SETTINGS } from '../types';

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
  maxPriceLimit,
  onPriceLimitChange,
  minPossiblePrice = 0,
  maxPossiblePrice = 1000,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const storeName = storeSettings?.storeName || DEFAULT_STORE_SETTINGS.storeName;
  const logoUrl = storeSettings?.logoUrl || DEFAULT_STORE_SETTINGS.logoUrl;

  const handleNavClick = (tabKey: string) => {
    if (onSelectTab) {
      onSelectTab(tabKey);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#09090e]/98 lg:backdrop-blur-md border-b border-zinc-800/70 shadow-lg text-white transform-gpu">
        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            
            {/* Left: Mobile Menu & Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-800/80 lg:hidden transition-colors cursor-pointer border border-zinc-800"
                aria-label="Abrir Menu Principal"
                title="Abrir Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <a href="#" className="flex items-center gap-2.5 group">
                <img
                  src={logoUrl}
                  alt={storeName}
                  className="w-10 h-10 rounded-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />

                <div>
                  <div className="flex flex-col items-center justify-center leading-none font-black font-sans">
                    {storeName === 'Woobox Shop' ? (
                      <>
                        <div className="text-base sm:text-lg font-black tracking-tight">
                          <span className="text-white">WOO</span>
                          <span className="bg-gradient-to-r from-[var(--wb-primary-light)] to-[var(--wb-primary)] bg-clip-text text-transparent">BOX</span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-zinc-300 font-black uppercase tracking-[0.22em] text-center mt-0.5">
                          SHOP
                        </span>
                      </>
                    ) : (
                      <span className="bg-gradient-to-r from-white to-[var(--wb-primary-light)] bg-clip-text text-transparent text-base sm:text-lg">
                        {storeName}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-xl relative">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar produtos por nome ou categoria..."
                  className="w-full pl-4 sm:pl-5 pr-12 py-2 text-xs sm:text-sm bg-zinc-900/90 text-zinc-100 placeholder-zinc-500 rounded-full border border-zinc-800 focus:border-[var(--wb-primary)]/60 focus:ring-1 focus:ring-[var(--wb-primary)]/10 transition-all outline-none"
                />

                <div className="absolute right-1.5 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange('')}
                      className="p-1 text-zinc-400 hover:text-white rounded-full mr-1 cursor-pointer"
                      title="Limpar busca"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    className="p-1.5 bg-[var(--wb-primary)] text-white rounded-full hover:brightness-110 transition-all shadow-sm cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Social Media & Favorites */}
            <div className="flex items-center gap-2.5 shrink-0">
              
              {/* TikTok Redirect Link */}
              <a
                href="https://www.tiktok.com/@woobox.shop"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-all hidden sm:flex items-center justify-center"
                title="Siga no TikTok"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.65 6.34 6.34 0 0 0 9.35 22a6.33 6.33 0 0 0 6.32-6.33V9.17a8.16 8.16 0 0 0 3.92 1V6.69z" />
                </svg>
              </a>

              {/* Instagram Redirect Link */}
              <a
                href="https://www.instagram.com/wooboxshop/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-zinc-400 hover:text-pink-400 hover:bg-zinc-800/80 rounded-xl transition-all hidden sm:flex items-center justify-center"
                title="Siga no Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>

              {/* Wishlist / Favorites Toggle */}
              <button
                onClick={onToggleFavoritesOnly}
                className={`relative p-2 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  showFavoritesOnly
                    ? 'bg-[var(--wb-primary)]/20 border-[var(--wb-primary)] text-[var(--wb-primary)]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                }`}
                title="Salvos"
              >
                <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-[var(--wb-primary)] text-[var(--wb-primary)]' : 'text-zinc-300'}`} />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {favoritesCount}
                  </span>
                )}
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/90 animate-in fade-in transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm bg-[#09090e] border-r border-zinc-800 h-full overflow-y-auto p-5 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={logoUrl}
                    alt={storeName}
                    className="w-10 h-10 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col items-start justify-center leading-none font-black font-sans">
                    {storeName === 'Woobox Shop' ? (
                      <>
                        <div className="text-base font-black tracking-tight">
                          <span className="text-white">WOO</span>
                          <span className="bg-gradient-to-r from-[var(--wb-primary-light)] to-[var(--wb-primary)] bg-clip-text text-transparent">BOX</span>
                        </div>
                        <span className="text-[10px] text-zinc-300 font-black uppercase tracking-[0.22em] mt-0.5">
                          SHOP
                        </span>
                      </>
                    ) : (
                      <span className="bg-gradient-to-r from-white to-[var(--wb-primary-light)] bg-clip-text text-transparent text-base font-black">
                        {storeName}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-xl border border-zinc-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Navigation Items */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block px-1">
                  Navegação Principal
                </span>

                <nav className="space-y-1">
                  <button
                    onClick={() => handleNavClick('inicio')}
                    className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      activeTab === 'inicio' && !showFavoritesOnly
                        ? 'bg-[var(--wb-primary)]/20 text-[var(--wb-primary)] border border-[var(--wb-primary)]/30'
                        : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Home className="w-4 h-4 text-[var(--wb-primary)]" />
                      <span>Início & Catálogo</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </button>

                  <button
                    onClick={() => handleNavClick('ofertas')}
                    className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      activeTab === 'ofertas'
                        ? 'bg-[var(--wb-primary)]/20 text-[var(--wb-primary)] border border-[var(--wb-primary)]/30'
                        : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span>Ofertas Imperdíveis</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </button>

                  <button
                    onClick={() => handleNavClick('mais-vendidos')}
                    className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      activeTab === 'mais-vendidos'
                        ? 'bg-[var(--wb-primary)]/20 text-[var(--wb-primary)] border border-[var(--wb-primary)]/30'
                        : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span>Mais Vendidos</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </button>

                  <button
                    onClick={() => handleNavClick('lancamentos')}
                    className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      activeTab === 'lancamentos'
                        ? 'bg-[var(--wb-primary)]/20 text-[var(--wb-primary)] border border-[var(--wb-primary)]/30'
                        : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Lançamentos</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </button>

                </nav>
              </div>

              {/* Price Range Adjustment */}
              {maxPriceLimit !== undefined && onPriceLimitChange && (
                <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block px-1">
                    Ajuste por Preço
                  </span>

                  <PriceSlider
                    value={maxPriceLimit}
                    min={minPossiblePrice}
                    max={maxPossiblePrice}
                    onChange={onPriceLimitChange}
                  />
                </div>
              )}

              {/* Wishlist Action */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onToggleFavoritesOnly();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    showFavoritesOnly
                      ? 'bg-[var(--wb-primary)] text-white shadow-lg'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-white' : 'text-rose-400'}`} />
                    <span>Seus Achadinhos Salvos</span>
                  </div>
                  {favoritesCount > 0 && (
                    <span className="px-2 py-0.5 bg-[var(--wb-primary)] text-white font-black text-[10px] rounded-full">
                      {favoritesCount}
                    </span>
                  )}
                </button>
              </div>

            </div>

            {/* Drawer Footer Social Links */}
            <div className="pt-6 border-t border-zinc-800/80 space-y-3">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                Redes Sociais
              </span>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://www.tiktok.com/@woobox.shop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 flex items-center justify-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.65 6.34 6.34 0 0 0 9.35 22a6.33 6.33 0 0 0 6.32-6.33V9.17a8.16 8.16 0 0 0 3.92 1V6.69z" />
                  </svg>
                  <span>TikTok</span>
                </a>

                <a
                  href="https://www.instagram.com/wooboxshop/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-pink-400 flex items-center justify-center gap-2 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
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
