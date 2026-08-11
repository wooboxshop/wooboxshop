import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import { Header } from './components/Header';
import { BannerSection } from './components/BannerSection';
import { FilterBar } from './components/FilterBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AdminUnlockModal } from './components/AdminUnlockModal';
import { AdminPanel } from './components/AdminPanel';
import { ProductFormModal } from './components/ProductFormModal';
import { HighlightFormModal } from './components/HighlightFormModal';
import { ShareModal } from './components/ShareModal';
import { Footer } from './components/Footer';
import { Product, Highlight, CategoryOption, StoreSettings, DEFAULT_STORE_SETTINGS } from './types';
import { INITIAL_CATEGORIES } from './data/initialData';
import {
  fetchProducts,
  fetchHighlights,
  fetchCategories,
  fetchStoreSettings,
  updateStoreSettings,
  trackProductClick,
  createProduct,
  updateProduct,
  deleteProduct,
  createHighlight,
  updateHighlight,
  verifyAdminCode,
  removeSubscriber,
  subscribeToProducts,
  subscribeToHighlights,
  subscribeToCategories,
  subscribeToStoreSettings,
} from './services/api';
import { Sparkles, Heart, PackageSearch, RefreshCcw, Filter, Flame, Trophy, Tag, TrendingUp, CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>(INITIAL_CATEGORIES);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [unsubscribedNotice, setUnsubscribedNotice] = useState<string | null>(null);

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

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('populares');
  const [onlyPromos, setOnlyPromos] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Admin states
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('woobox_admin_unlocked') === 'true';
  });
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Dynamic price limits calculated from registered products
  const { minPossiblePrice, maxPossiblePrice } = useMemo(() => {
    const activeProducts = isAdmin ? products : products.filter((p) => p.isActive);
    if (!activeProducts || activeProducts.length === 0) {
      return { minPossiblePrice: 0, maxPossiblePrice: 500 };
    }
    const prices = activeProducts.map((p) => p.price);
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    return { minPossiblePrice: min, maxPossiblePrice: max };
  }, [products, isAdmin]);

  const [maxPriceLimit, setMaxPriceLimit] = useState<number>(500);

  // Update maxPriceLimit when maxPossiblePrice is computed
  useEffect(() => {
    if (maxPossiblePrice > 0) {
      setMaxPriceLimit(maxPossiblePrice);
    }
  }, [maxPossiblePrice]);

  // Category product counts for sidebar badges
  const categoryCounts = useMemo(() => {
    const activeProds = products.filter((p) => isAdmin || p.isActive);
    const counts: Record<string, number> = {
      todos: activeProds.length,
    };

    categories.forEach((cat) => {
      if (cat.id === 'todos') return;
      counts[cat.id] = activeProds.filter((p) => {
        const pCat = p.category.toLowerCase();
        const cName = cat.name.toLowerCase();
        return pCat === cName || pCat.includes(cat.id.toLowerCase()) || cName.includes(pCat);
      }).length;
    });

    return counts;
  }, [products, isAdmin, categories]);

  // Sub-navigation tabs click handler
  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'ofertas') {
      setOnlyPromos(true);
      setSelectedCategory('todos');
      setSortBy('maior-desconto');
    } else if (tab === 'mais-vendidos') {
      setSortBy('populares');
      setOnlyPromos(false);
      setSelectedCategory('todos');
    } else if (tab === 'lancamentos') {
      setSortBy('recentes');
      setOnlyPromos(false);
      setSelectedCategory('todos');
    } else if (tab === 'categorias') {
      const catEl = document.getElementById('catalogo');
      if (catEl) catEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      // inicio / home
      setSortBy('populares');
      setOnlyPromos(false);
      setSelectedCategory('todos');
    }
  };

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('woobox_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Calculate valid active favorites matching existing products
  const validFavorites = useMemo(() => {
    return favorites.filter((id) =>
      products.some((p) => p.id === id && (isAdmin || p.isActive))
    );
  }, [favorites, products, isAdmin]);

  // Modals
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [sharingProduct, setSharingProduct] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isHighlightFormOpen, setIsHighlightFormOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);

  // Secret code detection using hashed verification
  const [codeDetected, setCodeDetected] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkCode = async () => {
      const q = searchQuery.trim();
      if (!q) {
        if (isMounted) setCodeDetected(false);
        return;
      }
      const isValid = await verifyAdminCode(q);
      if (isMounted) setCodeDetected(isValid);
    };
    checkCode();
    return () => {
      isMounted = false;
    };
  }, [searchQuery]);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('woobox_favorites', JSON.stringify(favorites));
    } catch (err) {
      console.error(err);
    }
  }, [favorites]);

  // Real-time live synchronization with Firestore Database across all devices (PC, Mobile, Tablet)
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
      if (settingsData) setStoreSettings(settingsData);
    });

    return () => {
      unsubProducts();
      unsubHighlights();
      unsubCategories();
      unsubSettings();
    };
  }, []);

  const handleUpdateStoreSettings = async (newSettings: Partial<StoreSettings>) => {
    try {
      const updated = await updateStoreSettings(newSettings);
      setStoreSettings(updated);
    } catch (err) {
      console.error('Failed to update store settings:', err);
    }
  };

  const loadInitialData = async () => {
    // Realtime listeners automatically maintain state updated live,
    // but this callback satisfies any legacy refresh invocation.
  };

  // When secret code is detected, auto-trigger modal ONLY if searchQuery is active and non-empty
  useEffect(() => {
    if (codeDetected && !isAdmin && searchQuery.trim().length > 0) {
      setIsUnlockModalOpen(true);
      setSearchQuery('');
    }
  }, [codeDetected, isAdmin, searchQuery]);

  // Ensure search query is cleared whenever unlock modal opens
  useEffect(() => {
    if (isUnlockModalOpen) {
      setSearchQuery('');
    }
  }, [isUnlockModalOpen]);

  // Unlock admin handler
  const handleSuccessUnlockAdmin = () => {
    setIsAdmin(true);
    localStorage.setItem('woobox_admin_unlocked', 'true');
    setIsAdminPanelOpen(true);
    setIsUnlockModalOpen(false);
  };

  // Lock / Logout admin handler - returns to home page layout
  const handleLockAdmin = () => {
    setCodeDetected(false);
    setIsAdmin(false);
    localStorage.removeItem('woobox_admin_unlocked');
    setIsAdminPanelOpen(false);
    setIsUnlockModalOpen(false);
    setSearchQuery('');
    setSelectedCategory('todos');
    setShowFavoritesOnly(false);
    setSortBy('populares');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle favorite item
  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Affiliate link purchase redirect + click tracking
  const handleBuyClick = async (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Increment local clicks counter instantly
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, clicksCount: (p.clicksCount || 0) + 1 } : p))
    );

    // Call backend API to persist click log
    trackProductClick(product.id, 'app_card');

    // Open affiliate link in new tab
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  // Product Form Save (Create / Edit)
  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (editingProduct) {
      const updated = await updateProduct(editingProduct.id, productData);
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
    } else {
      const created = await createProduct(productData);
      setProducts((prev) => [created, ...prev]);
    }
  };

  // Product Delete
  const handleDeleteProduct = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Product Active Toggle
  const handleToggleActiveProduct = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = await updateProduct(product.id, { isActive: !product.isActive });
    setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
  };

  // Highlight Form Save (Create / Edit)
  const handleSaveHighlight = async (highlightData: Partial<Highlight>) => {
    if (editingHighlight) {
      const updated = await updateHighlight(editingHighlight.id, highlightData);
      setHighlights((prev) => prev.map((h) => (h.id === editingHighlight.id ? updated : h)));
    } else {
      const created = await createHighlight(highlightData);
      setHighlights((prev) => [...prev, created]);
    }
  };

  // Open modals helper
  const handleOpenEditProductModal = (product?: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingProduct(product || null);
    setIsProductFormOpen(true);
  };

  const handleOpenEditHighlightModal = (highlight?: Highlight) => {
    setEditingHighlight(highlight || null);
    setIsHighlightFormOpen(true);
  };

  const deferredMaxPriceLimit = useDeferredValue(maxPriceLimit);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Filtered and Sorted Products computation
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Non-admin view hides inactive products
    if (!isAdmin) {
      result = result.filter((p) => p.isActive);
    }

    // Favorites filter
    if (showFavoritesOnly) {
      result = result.filter((p) => favorites.includes(p.id));
    }

    // Text search query (ignoring secret code)
    if (deferredSearchQuery && deferredSearchQuery.toLowerCase().trim() !== 'wooboxadm99') {
      const q = deferredSearchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.badge && p.badge.toLowerCase().includes(q))
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

    // Highlight Event filter
    if (selectedHighlightId) {
      const currentHL = highlights.find((h) => h.id === selectedHighlightId);
      result = result.filter((p) => {
        if (p.highlightId === selectedHighlightId) return true;
        if (currentHL?.tagFilter && p.badge?.toLowerCase().includes(currentHL.tagFilter.toLowerCase())) return true;
        return false;
      });
    }

    // Only Promos filter
    if (onlyPromos) {
      result = result.filter((p) => p.originalPrice && p.originalPrice > p.price);
    }

    // Dynamic price limit filter (+ 0.99 tolerance so R$ 34.90 is included when min slider limit is 34)
    if (deferredMaxPriceLimit < maxPossiblePrice) {
      result = result.filter((p) => p.price <= deferredMaxPriceLimit + 0.99);
    }

    // Sorting logic based on filter selection
    result.sort((a, b) => {
      if (sortBy === 'menor-preco') return a.price - b.price;
      if (sortBy === 'maior-preco') return b.price - a.price;
      if (sortBy === 'maior-desconto') {
        const descA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const descB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return descB - descA;
      }
      if (sortBy === 'recentes') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      // Default / 'populares': Strictly sort by popularity (clicks count) then rating/reviews engagement
      const clicksDiff = (b.clicksCount || 0) - (a.clicksCount || 0);
      if (clicksDiff !== 0) return clicksDiff;
      return (b.rating * b.reviewsCount) - (a.rating * a.reviewsCount);
    });

    return result;
  }, [
    products,
    isAdmin,
    showFavoritesOnly,
    favorites,
    deferredSearchQuery,
    selectedCategory,
    selectedHighlightId,
    highlights,
    onlyPromos,
    deferredMaxPriceLimit,
    maxPossiblePrice,
    sortBy,
    activeTab,
  ]);

  // Reset all filters handler
  const handleResetFilters = () => {
    setSelectedCategory('todos');
    setSelectedHighlightId(null);
    setSortBy('populares');
    setOnlyPromos(false);
    setShowFavoritesOnly(false);
    setSearchQuery('');
    setMaxPriceLimit(maxPossiblePrice);
    setActiveTab('inicio');
  };

  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100 font-sans selection:bg-pink-500 selection:text-white">
      {/* Header Bar */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isAdmin={isAdmin}
        onOpenAdmin={() => setIsAdminPanelOpen(true)}
        onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
        favoritesCount={validFavorites.length}
        onToggleFavoritesOnly={() => setShowFavoritesOnly((prev) => !prev)}
        showFavoritesOnly={showFavoritesOnly}
        codeDetected={codeDetected}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        storeSettings={storeSettings}
        maxPriceLimit={maxPriceLimit}
        onPriceLimitChange={setMaxPriceLimit}
        minPossiblePrice={minPossiblePrice}
        maxPossiblePrice={maxPossiblePrice}
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

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* Seasonal Highlights / Events Banners */}
        {!showFavoritesOnly && (
          <BannerSection
            highlights={highlights}
            selectedHighlightId={selectedHighlightId}
            onSelectHighlight={setSelectedHighlightId}
            onExploreClick={() => {
              const catEl = document.getElementById('catalogo');
              if (catEl) catEl.scrollIntoView({ behavior: 'smooth' });
            }}
            storeSettings={storeSettings}
          />
        )}

        {/* Favorites Header Banner */}
        {showFavoritesOnly && (
          <div className="p-6 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white rounded-3xl shadow-xl flex items-center justify-between border border-pink-500/30">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <div>
                <h2 className="text-xl font-black">Seus Achadinhos Salvos</h2>
                <p className="text-xs text-rose-100">
                  {validFavorites.length} produto{validFavorites.length !== 1 ? 's' : ''} salvo{validFavorites.length !== 1 ? 's' : ''} na sua lista de desejos.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFavoritesOnly(false)}
              className="px-4 py-2 bg-zinc-950 text-white border border-pink-500/40 text-xs font-bold rounded-2xl hover:bg-zinc-900 transition-colors"
            >
              Ver Catálogo Completo
            </button>
          </div>
        )}

        {/* Main Split Layout: Sidebar (Left) + Products Grid (Right) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Sidebar Filters */}
          <FilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
            maxPriceLimit={maxPriceLimit}
            onPriceLimitChange={setMaxPriceLimit}
            minPossiblePrice={minPossiblePrice}
            maxPossiblePrice={maxPossiblePrice}
            onlyPromos={onlyPromos}
            onTogglePromos={() => setOnlyPromos((prev) => !prev)}
            totalResults={processedProducts.length}
            categoryCounts={categoryCounts}
            onResetFilters={handleResetFilters}
            isOpenMobile={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
          />

          {/* Right Main Content */}
          <div className="flex-1 min-w-0 w-full space-y-5">
            
            {/* Top Toolbar for Mobile Drawer Trigger & Category Pills */}
            <div id="catalogo" className="bg-[#0e0d16]/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-zinc-800/80 shadow-lg flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden px-3 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs rounded-xl border border-zinc-800/80 flex items-center gap-1.5 transition-all active:scale-95 shrink-0 cursor-pointer shadow-sm"
                >
                  <Filter className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Filtros</span>
                </button>

                <div className="hidden lg:flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-pink-500 fill-pink-500/20" />
                  <h2 className="text-sm font-extrabold text-white">
                    {selectedCategory !== 'todos'
                      ? categories.find((c) => c.id === selectedCategory)?.name
                      : sortBy === 'populares'
                      ? '🔥 Mais Populares'
                      : sortBy === 'recentes'
                      ? '✨ Lançamentos Recentes'
                      : sortBy === 'maior-desconto'
                      ? '🏷️ Maiores Ofertas'
                      : '✨ Vitrine de Produtos'}
                  </h2>
                  <span className="text-xs text-zinc-400 font-normal">
                    ({processedProducts.length} itens)
                  </span>
                </div>
              </div>

              {/* Horizontal Category Pill Scrollbar */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 lg:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      selectedCategory === cat.id
                        ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                        : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading Spinner */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3 text-zinc-400">
                <RefreshCcw className="w-8 h-8 animate-spin text-pink-500" />
                <p className="text-xs font-bold">Carregando produtos...</p>
              </div>
            ) : processedProducts.length === 0 ? (
              /* Empty Search or Filters State */
              <div className="py-16 text-center bg-[#0d0c15] rounded-3xl border border-zinc-800 p-8 space-y-4 shadow-xl">
                <div className="w-16 h-16 mx-auto bg-pink-500/10 text-pink-400 rounded-full flex items-center justify-center border border-pink-500/20">
                  {showFavoritesOnly ? <Heart className="w-8 h-8 text-pink-500 fill-pink-500/30" /> : <PackageSearch className="w-8 h-8" />}
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">
                    {showFavoritesOnly ? 'Sua lista de favoritos está vazia' : 'Nenhum produto encontrado'}
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    {showFavoritesOnly
                      ? 'Clique no ícone de coração nos produtos para salvá-los e acessá-los rapidamente quando quiser!'
                      : 'Tente ajustar a barra de preço, pesquisar por outro termo ou trocar de categoria.'}
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-bold text-xs rounded-2xl shadow-lg transition-transform active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  {showFavoritesOnly ? 'Explorar Catálogo de Ofertas' : 'Limpar Todos os Filtros'}
                </button>
              </div>
            ) : (
              /* Products Grid (4 columns on desktop inside right panel) */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {processedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    rankIndex={sortBy === 'populares' ? index + 1 : undefined}
                    onClickProduct={(p) => setSelectedProductDetail(p)}
                    onBuyClick={handleBuyClick}
                    isFavorite={favorites.includes(product.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onShareClick={(p, e) => {
                      if (e) e.stopPropagation();
                      setSharingProduct(p);
                    }}
                    isAdmin={isAdmin}
                    onEditProduct={handleOpenEditProductModal}
                    onDeleteProduct={handleDeleteProduct}
                    onToggleActiveProduct={handleToggleActiveProduct}
                  />
                ))}
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer
        onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
        isAdmin={isAdmin}
        storeSettings={storeSettings}
      />

      {/* Modals & Overlays */}
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

      <AdminUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onSuccessUnlock={handleSuccessUnlockAdmin}
      />

      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        products={products}
        highlights={highlights}
        categories={categories}
        onRefreshData={loadInitialData}
        onOpenProductForm={handleOpenEditProductModal}
        onOpenHighlightForm={handleOpenEditHighlightModal}
        onLockAdmin={handleLockAdmin}
        storeSettings={storeSettings}
        onUpdateStoreSettings={handleUpdateStoreSettings}
      />

      <ProductFormModal
        isOpen={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
        highlights={highlights}
        categories={categories}
      />

      <HighlightFormModal
        isOpen={isHighlightFormOpen}
        onClose={() => setIsHighlightFormOpen(false)}
        onSave={handleSaveHighlight}
        editingHighlight={editingHighlight}
      />
    </div>
  );
}
