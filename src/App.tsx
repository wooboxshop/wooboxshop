import React, { useState, useEffect, useMemo, useCallback, useDeferredValue, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FeaturedProductsBanner } from './components/FeaturedProductsBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ShareModal } from './components/ShareModal';
import { Footer } from './components/Footer';
import { Product, Highlight, CategoryOption, PlatformType, StoreSettings, DEFAULT_STORE_SETTINGS, getReadableTextColor, normalizeStoreSettingsTheme } from './types';
import { INITIAL_CATEGORIES } from './data/initialData';
import {
  trackProductClick,
  removeSubscriber,
  subscribeToProducts,
  subscribeToHighlights,
  subscribeToCategories,
  subscribeToStoreSettings,
} from './services/api';
import {
  Sparkles,
  Heart,
  PackageSearch,
  RefreshCcw,
  CheckCircle2,
  X,
  Flame,
} from 'lucide-react';
import { PriceRangeValue } from './components/PriceRangeFilter';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>(INITIAL_CATEGORIES);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [unsubscribedNotice, setUnsubscribedNotice] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('inicio');
  const [subTab, setSubTab] = useState<'em-alta' | 'mais-vendidos' | 'novidades' | 'descontos'>('em-alta');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<PriceRangeValue | null>(null);

  // Check URL parameters for newsletter unsubscribe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailToUnsubscribe = params.get('unsubscribe');
    if (emailToUnsubscribe) {
      const cleanEmail = emailToUnsubscribe.trim();
      if (cleanEmail) {
        removeSubscriber(cleanEmail).then(() => {
          setUnsubscribedNotice(`O e-mail ${cleanEmail} foi desinscrito com sucesso da newsletter do Woobox Shop.`);
          try {
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (e) {}
        });
      }
    }
  }, []);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('woobox_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('woobox_favorites', JSON.stringify(favorites));
    } catch (err) {
      console.error(err);
    }
  }, [favorites]);

  // Real-time live synchronization with Firestore Database
  useEffect(() => {
    setLoading(true);
    let initialLoads = 0;
    const markLoaded = () => {
      initialLoads++;
      if (initialLoads >= 1) {
        setLoading(false);
      }
    };

    const unsubProducts = subscribeToProducts((prods) => {
      setProducts(prods);
      markLoaded();
    });

    const unsubHighlights = subscribeToHighlights((hls) => {
      setHighlights(hls);
    });

    const unsubCategories = subscribeToCategories((cats) => {
      if (cats && cats.length > 0) setCategories(cats);
    });

    const unsubSettings = subscribeToStoreSettings((settingsData) => {
      if (settingsData) setStoreSettings(normalizeStoreSettingsTheme(settingsData));
    });

    return () => {
      unsubProducts();
      unsubHighlights();
      unsubCategories();
      unsubSettings();
    };
  }, []);

  // Apply store theme colors as CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--wb-primary', storeSettings.themePrimaryColor || DEFAULT_STORE_SETTINGS.themePrimaryColor!);
    root.style.setProperty('--wb-accent', storeSettings.themeAccentColor || DEFAULT_STORE_SETTINGS.themeAccentColor!);
    root.style.setProperty('--wb-interface', storeSettings.themePrimaryColor || DEFAULT_STORE_SETTINGS.themePrimaryColor!);
    root.style.setProperty('--wb-positive', storeSettings.themeAccentColor || DEFAULT_STORE_SETTINGS.themeAccentColor!);
    const offerButtonColor = storeSettings.themeOfferButtonColor || DEFAULT_STORE_SETTINGS.themeOfferButtonColor!;
    root.style.setProperty('--wb-offer-button', offerButtonColor);
    root.style.setProperty('--wb-offer-button-text', getReadableTextColor(offerButtonColor));
  }, [storeSettings.themePrimaryColor, storeSettings.themeAccentColor, storeSettings.themeOfferButtonColor]);

  // Modals state
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [sharingProduct, setSharingProduct] = useState<Product | null>(null);

  // Toggle favorite item
  const handleToggleFavorite = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  // Affiliate link purchase redirect + click tracking
  const handleBuyClick = useCallback(async (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, clicksCount: (p.clicksCount || 0) + 1 } : p))
    );

    trackProductClick(product.id, 'app_card');
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
  }, []);

  const handleProductClick = useCallback((p: Product) => {
    setSelectedProductDetail(p);
  }, []);

  const handleShareClick = useCallback((p: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSharingProduct(p);
  }, []);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Calculate valid active favorites
  const validFavorites = useMemo(() => {
    return favorites.filter((id) =>
      products.some((p) => p.id === id && p.isActive)
    );
  }, [favorites, products]);

  const activeProducts = useMemo(() => products.filter((product) => product.isActive), [products]);

  const availablePlatforms = useMemo(
    () => Array.from(new Set(activeProducts.map((product) => product.platform))) as PlatformType[],
    [activeProducts]
  );

  const priceBounds = useMemo<PriceRangeValue>(() => {
    if (activeProducts.length === 0) return { min: 0, max: 0 };
    const prices = activeProducts.map((product) => product.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [activeProducts]);

  useEffect(() => {
    setPriceRange(priceBounds);
  }, [priceBounds.min, priceBounds.max]);

  const effectivePriceRange = priceRange || priceBounds;

  // Main filtered products computation
  const processedProducts = useMemo(() => {
    let result = products.filter((p) => p.isActive);

    // Favorites filter
    if (showFavoritesOnly) {
      result = result.filter((p) => favorites.includes(p.id));
    }

    // Text search query
    if (deferredSearchQuery) {
      const q = deferredSearchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'todos') {
      const catObj = categories.find((c) => c.id === selectedCategory);
      if (catObj) {
        result = result.filter((p) => {
          const pCat = p.category.toLowerCase();
          const cName = catObj.name.toLowerCase();
          return pCat === cName || pCat.includes(catObj.id.toLowerCase()) || cName.includes(pCat);
        });
      }
    }

    // Partner Platform filter
    if (selectedPlatform) {
      result = result.filter((p) => p.platform.toLowerCase() === selectedPlatform.toLowerCase());
    }

    result = result.filter(
      (product) => product.price >= effectivePriceRange.min && product.price <= effectivePriceRange.max
    );

    // Navigation Tab Filters
    if (activeTab === 'ofertas') {
      result = result.filter((p) => p.originalPrice && p.originalPrice > p.price);
    }

    // Sub-tab sorting / filtering
    result.sort((a, b) => {
      if (activeTab === 'ofertas') {
        const descA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const descB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return descB - descA;
      }
      if (activeTab === 'novidades') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (activeTab === 'mais-vendidos') {
        return (b.clicksCount || 0) - (a.clicksCount || 0);
      }

      if (subTab === 'descontos') {
        const descA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const descB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return descB - descA;
      }
      if (subTab === 'novidades') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (subTab === 'mais-vendidos') {
        return (b.clicksCount || 0) - (a.clicksCount || 0);
      }

      // Início / Em alta: o ranking visual segue o contador real de acessos.
      const clickDiff = (b.clicksCount || 0) - (a.clicksCount || 0);
      if (clickDiff !== 0) return clickDiff;

      const qualityDiff = (b.rating * b.reviewsCount) - (a.rating * a.reviewsCount);
      if (qualityDiff !== 0) return qualityDiff;

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [
    products,
    showFavoritesOnly,
    favorites,
    deferredSearchQuery,
    selectedCategory,
    selectedPlatform,
    effectivePriceRange.min,
    effectivePriceRange.max,
    categories,
    activeTab,
    subTab,
  ]);

  // Featured products shown in the top banner
  const featuredProductIds = useMemo(() => {
    const active = products.filter((p) => p.isActive);
    const explicitlyFeatured = active.filter((p) => p.isFeatured);
    const list = explicitlyFeatured.length > 0 ? explicitlyFeatured : active.slice(0, 4);
    return new Set(list.map((p) => p.id));
  }, [products]);

  // Catalog products (excluding featured products so they are not repeated in "Nossa Vitrine")
  const catalogProducts = useMemo(() => {
    if (showFavoritesOnly) {
      return processedProducts;
    }
    return processedProducts.filter((p) => !featuredProductIds.has(p.id));
  }, [processedProducts, featuredProductIds, showFavoritesOnly]);

  const handleResetFilters = () => {
    setSelectedCategory('todos');
    setSelectedPlatform(null);
    setActiveTab('inicio');
    setSubTab('em-alta');
    setShowFavoritesOnly(false);
    setSearchQuery('');
    setPriceRange(priceBounds);
  };

  return (
    <div className="min-h-screen bg-[#09090d] text-zinc-100 font-sans selection:bg-[var(--wb-interface)]/30 selection:text-white">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        favoritesCount={validFavorites.length}
        onToggleFavoritesOnly={() => setShowFavoritesOnly((prev) => !prev)}
        showFavoritesOnly={showFavoritesOnly}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'inicio') setSubTab('em-alta');
          if (tab === 'mais-vendidos') setSubTab('mais-vendidos');
          if (tab === 'ofertas') setSubTab('descontos');
          if (tab === 'novidades') setSubTab('novidades');
          if (tab === 'inicio') {
            setSelectedCategory('todos');
            setSelectedPlatform(null);
          }
        }}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(category) => {
          setSelectedCategory(category);
          setSelectedPlatform(null);
          setShowFavoritesOnly(false);
        }}
        selectedPlatform={selectedPlatform}
        onSelectPlatform={(platform) => {
          setSelectedPlatform(platform);
          setShowFavoritesOnly(false);
        }}
        availablePlatforms={availablePlatforms}
        priceBounds={priceBounds}
        priceRange={effectivePriceRange}
        onPriceRangeChange={setPriceRange}
        storeSettings={storeSettings}
      />

      {/* Unsubscribe Notice Banner */}
      {unsubscribedNotice && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 px-4 py-3 text-xs sm:text-sm font-bold text-center flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{unsubscribedNotice}</span>
          <button
            onClick={() => setUnsubscribedNotice(null)}
            className="ml-3 p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-500/20 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Page Layout */}
      <main className="max-w-[1480px] mx-auto px-2 sm:px-6 lg:px-8 py-3.5 sm:py-6 space-y-4 sm:space-y-8 overflow-hidden">
        
        {/* Favorites Header Banner (only when there are saved favorites) */}
        {showFavoritesOnly && validFavorites.length > 0 && (
          <div className="p-3.5 sm:p-5 bg-[#111116] text-white rounded-2xl sm:rounded-3xl flex items-center justify-between gap-3 ring-1 ring-white/[0.08]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 sm:p-3 bg-rose-500/10 rounded-xl sm:rounded-2xl shrink-0">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-rose-400 text-rose-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-xl font-black leading-tight">
                  <span>Seus Produtos Salvos</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-400 truncate">
                  {validFavorites.length} produto{validFavorites.length !== 1 ? 's' : ''} salvo{validFavorites.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFavoritesOnly(false)}
              className="px-3 sm:px-4 py-2 bg-zinc-950 text-white text-[11px] sm:text-xs font-bold rounded-xl sm:rounded-2xl hover:bg-zinc-900 transition-colors cursor-pointer shrink-0"
            >
              <span className="sm:hidden">Ver catálogo</span>
              <span className="hidden sm:inline">Ver catálogo completo</span>
            </button>
          </div>
        )}

        {/* Master Flex Container: Left Sidebar + Right Main Stream */}
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-6 items-start">
          
          {/* Left Sidebar */}
          <Sidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              setShowFavoritesOnly(false);
            }}
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              if (tab === 'inicio') setSubTab('em-alta');
              if (tab === 'mais-vendidos') setSubTab('mais-vendidos');
              if (tab === 'ofertas') setSubTab('descontos');
              if (tab === 'novidades') setSubTab('novidades');
              setShowFavoritesOnly(false);
            }}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={(platform) => {
              setSelectedPlatform(platform);
              setShowFavoritesOnly(false);
            }}
            availablePlatforms={availablePlatforms}
            priceBounds={priceBounds}
            priceRange={effectivePriceRange}
            onPriceRangeChange={setPriceRange}
          />

          {/* Right Main Body Content */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            
            {/* Top Featured Banner */}
            {!showFavoritesOnly && (
              <div>
                <FeaturedProductsBanner
                  products={products}
                  onClickProduct={handleProductClick}
                  onBuyClick={handleBuyClick}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  storeSettings={storeSettings}
                />
              </div>
            )}

            {/* Section: Vitrine */}
            <section id="catalogo-section" className="space-y-4 scroll-mt-24 min-w-0">
              
              {/* Section Header Row */}
              <div className="flex items-center justify-between gap-3 pb-1">
                
                {/* Filter Pills Tabs (Left) */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 pr-2 sm:pr-0">
                  <button
                    onClick={() => { setActiveTab('inicio'); setSubTab('em-alta'); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                      subTab === 'em-alta'
                        ? 'bg-[var(--wb-interface)]/10 text-[var(--wb-interface-light)] border-[var(--wb-interface)]/30 font-semibold'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    Em alta
                  </button>

                  <button
                    onClick={() => { setActiveTab('inicio'); setSubTab('novidades'); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                      subTab === 'novidades'
                        ? 'bg-[var(--wb-interface)]/10 text-[var(--wb-interface-light)] border-[var(--wb-interface)]/30 font-semibold'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    Novidades
                  </button>

                  <button
                    onClick={() => { setActiveTab('inicio'); setSubTab('descontos'); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                      subTab === 'descontos'
                        ? 'bg-[var(--wb-interface)]/10 text-[var(--wb-interface-light)] border-[var(--wb-interface)]/30 font-semibold'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    Descontos
                  </button>
                </div>
              </div>

              {/* Products Display */}
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3 text-zinc-400">
                  <RefreshCcw className="w-8 h-8 animate-spin text-[var(--wb-interface-light)]" />
                  <p className="text-xs font-bold">Carregando catálogo...</p>
                </div>
              ) : catalogProducts.length === 0 ? (
                <div className="py-10 sm:py-12 text-center bg-[#0e0d16] rounded-2xl sm:rounded-3xl ring-1 ring-white/[0.06] px-5 space-y-4">
                  <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ring-1 ${showFavoritesOnly ? 'bg-rose-500/10 text-rose-300 ring-rose-400/20' : 'bg-[var(--wb-interface)]/10 text-[var(--wb-interface-light)] ring-[var(--wb-interface)]/20'}`}>
                    {showFavoritesOnly ? <Heart className="w-7 h-7 fill-current/25" /> : <PackageSearch className="w-7 h-7" />}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {showFavoritesOnly ? 'Sua lista de favoritos está vazia' : 'Nenhum produto encontrado'}
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      {showFavoritesOnly
                        ? 'Salve os produtos que você quer encontrar de novo.'
                        : 'Tente pesquisar por outro termo ou trocar de categoria.'}
                    </p>
                  </div>
                  <button
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{showFavoritesOnly ? 'Explorar Ofertas' : 'Limpar filtros'}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-5 items-stretch">
                  {catalogProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variant="standard"
                      rankIndex={subTab === 'em-alta' ? index + 1 : undefined}
                      onClickProduct={handleProductClick}
                      onBuyClick={handleBuyClick}
                      isFavorite={favorites.includes(product.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onShareClick={handleShareClick}
                    />
                  ))}
                </div>
              )}
            </section>

          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer
        storeSettings={storeSettings}
        onNavigateHome={() => {
          setActiveTab('inicio');
          setSubTab('em-alta');
          setSelectedCategory('todos');
          setSelectedPlatform(null);
          setShowFavoritesOnly(false);
          setSearchQuery('');
        }}
      />

      {/* Modals */}
      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onBuyClick={(p) => handleBuyClick(p)}
        isFavorite={selectedProductDetail ? favorites.includes(selectedProductDetail.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onShareClick={(p) => setSharingProduct(p)}
      />

      <ShareModal
        product={sharingProduct}
        onClose={() => setSharingProduct(null)}
      />
    </div>
  );
}
