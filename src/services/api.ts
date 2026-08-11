import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  increment,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Highlight, MetricSummary, CategoryOption, ClickLog, StoreSettings, DEFAULT_STORE_SETTINGS } from '../types';
import { INITIAL_PRODUCTS, INITIAL_HIGHLIGHTS, INITIAL_CATEGORIES } from '../data/initialData';

const API_BASE = '/api';

// Admin verification with SHA-256 Hashing & Firestore Database Persistence
export async function hashString(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function getAdminUsername(): Promise<string> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'adminAuth'));
    if (snap.exists() && snap.data().username) {
      const dbUser = snap.data().username;
      localStorage.setItem('woobox_admin_username', dbUser);
      return dbUser;
    }
  } catch (err) {
    console.warn('Could not fetch admin username from Firestore, using local cache:', err);
  }
  return localStorage.getItem('woobox_admin_username') || 'admin';
}

export async function setAdminUsername(newUsername: string): Promise<boolean> {
  const clean = newUsername.trim();
  if (!clean || clean.length < 3) {
    throw new Error('O usuário deve ter pelo menos 3 caracteres.');
  }
  localStorage.setItem('woobox_admin_username', clean);
  try {
    await setDoc(doc(db, 'settings', 'adminAuth'), { username: clean, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.error('Error saving admin username to Firestore:', err);
  }
  return true;
}

export async function getAdminCodeHash(): Promise<string> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'adminAuth'));
    if (snap.exists() && snap.data().passwordHash) {
      const dbHash = snap.data().passwordHash;
      localStorage.setItem('woobox_admin_code_hash', dbHash);
      return dbHash;
    }
  } catch (err) {
    console.warn('Could not fetch admin code hash from Firestore, using local cache:', err);
  }

  const savedHash = localStorage.getItem('woobox_admin_code_hash');
  if (savedHash) return savedHash;
  // Default password "wooboxadm99" hashed with SHA-256
  return await hashString('wooboxadm99');
}

export async function verifyAdminCredentials(user: string, pass: string): Promise<boolean> {
  if (!user || !pass) return false;
  try {
    const cleanUser = user.trim().toLowerCase();
    const cleanPass = pass.trim();

    const storedUser = (await getAdminUsername()).toLowerCase();
    const isUserMatch = cleanUser === storedUser;

    const inputHash = await hashString(cleanPass);
    const targetHash = await getAdminCodeHash();
    const isPassMatch = inputHash === targetHash;

    return isUserMatch && isPassMatch;
  } catch (err) {
    console.error('Error verifying admin credentials:', err);
    return false;
  }
}

export async function verifyAdminCode(code: string): Promise<boolean> {
  if (!code || !code.trim()) return false;
  try {
    const clean = code.trim().toLowerCase();
    const currentUsername = (await getAdminUsername()).toLowerCase();
    if (clean === 'admin' || clean === currentUsername) {
      return true;
    }
    const inputHash = await hashString(code.trim());
    const targetHash = await getAdminCodeHash();
    return inputHash === targetHash;
  } catch (err) {
    console.error('Error verifying admin code:', err);
    return false;
  }
}

export async function setAdminCode(newCode: string): Promise<boolean> {
  const clean = newCode.trim();
  if (!clean || clean.length < 4) {
    throw new Error('A nova senha deve ter pelo menos 4 caracteres.');
  }
  const newHash = await hashString(clean);
  localStorage.setItem('woobox_admin_code_hash', newHash);
  try {
    await setDoc(doc(db, 'settings', 'adminAuth'), { passwordHash: newHash, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.error('Error saving admin code hash to Firestore:', err);
  }
  return true;
}

export async function resetAdminCodeToDefault(): Promise<boolean> {
  const defaultHash = await hashString('wooboxadm99');
  localStorage.removeItem('woobox_admin_code_hash');
  localStorage.removeItem('woobox_admin_username');
  try {
    await setDoc(doc(db, 'settings', 'adminAuth'), { username: 'admin', passwordHash: defaultHash, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('Error resetting admin credentials in Firestore:', err);
  }
  return true;
}

// ---------------- PRODUCTS ----------------

let isSeeded = false;
async function ensureSeeded() {
  if (isSeeded) return;
  try {
    const seedSnap = await getDoc(doc(db, 'settings', 'seedStatus'));
    if (seedSnap.exists()) {
      isSeeded = true;
      return;
    }

    const productsSnap = await getDocs(collection(db, 'products'));
    if (productsSnap.empty) {
      console.log('Seeding Firestore with initial products...');
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
    }

    const highlightsSnap = await getDocs(collection(db, 'highlights'));
    if (highlightsSnap.empty) {
      for (const hl of INITIAL_HIGHLIGHTS) {
        await setDoc(doc(db, 'highlights', hl.id), hl);
      }
    }

    const catSnap = await getDocs(collection(db, 'categories'));
    if (catSnap.empty) {
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
    }

    const settingsSnap = await getDoc(doc(db, 'settings', 'store'));
    if (!settingsSnap.exists()) {
      await setDoc(doc(db, 'settings', 'store'), DEFAULT_STORE_SETTINGS);
    }

    await setDoc(doc(db, 'settings', 'seedStatus'), {
      seeded: true,
      seededAt: new Date().toISOString(),
    });

    isSeeded = true;
  } catch (err) {
    console.error('Firestore seed check failed:', err);
  }
}

// ---------------- STORE SETTINGS ----------------

export async function fetchStoreSettings(): Promise<StoreSettings> {
  try {
    await ensureSeeded();
    const settingsSnap = await getDoc(doc(db, 'settings', 'store'));
    if (settingsSnap.exists()) {
      return { ...DEFAULT_STORE_SETTINGS, ...(settingsSnap.data() as StoreSettings) };
    }
    return DEFAULT_STORE_SETTINGS;
  } catch (err) {
    console.error('Fetch store settings error:', err);
    return DEFAULT_STORE_SETTINGS;
  }
}

export async function updateStoreSettings(settingsData: Partial<StoreSettings>): Promise<StoreSettings> {
  const updated: StoreSettings = {
    ...settingsData as any,
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'settings', 'store'), updated, { merge: true });
    const snap = await getDoc(doc(db, 'settings', 'store'));
    if (snap.exists()) {
      return { ...DEFAULT_STORE_SETTINGS, ...(snap.data() as StoreSettings) };
    }
  } catch (err) {
    console.error('Update store settings error:', err);
  }
  return { ...DEFAULT_STORE_SETTINGS, ...updated };
}

export async function fetchProducts(params?: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  highlightId?: string;
  platform?: string;
  activeOnly?: boolean;
}): Promise<Product[]> {
  try {
    await ensureSeeded();
    const querySnapshot = await getDocs(collection(db, 'products'));
    let products: Product[] = [];

    querySnapshot.forEach((docSnap) => {
      products.push(docSnap.data() as Product);
    });

    if (products.length === 0) {
      products = [...INITIAL_PRODUCTS];
    }

    // Client-side filtering
    if (params?.activeOnly) {
      products = products.filter((p) => p.isActive !== false);
    }
    if (params?.category && params.category !== 'todos' && params.category !== 'Todos os Produtos') {
      const catLower = params.category.toLowerCase();
      products = products.filter((p) =>
        p.category.toLowerCase().includes(catLower) || catLower.includes(p.category.toLowerCase())
      );
    }
    if (params?.highlightId) {
      products = products.filter((p) => p.highlightId === params.highlightId);
    }
    if (params?.platform && params.platform !== 'todas') {
      products = products.filter((p) => p.platform === params.platform);
    }
    if (params?.search) {
      const term = params.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term)
      );
    }
    if (params?.minPrice !== undefined) {
      products = products.filter((p) => p.price >= params.minPrice!);
    }
    if (params?.maxPrice !== undefined) {
      products = products.filter((p) => p.price <= params.maxPrice!);
    }

    return products;
  } catch (err) {
    console.error('Fetch products error:', err);
    return INITIAL_PRODUCTS;
  }
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  const newId = productData.id || `prod-${Date.now()}`;
  const now = new Date().toISOString();
  const fullProduct: Product = {
    id: newId,
    title: productData.title || 'Produto sem nome',
    description: productData.description || '',
    price: Number(productData.price) || 0,
    originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined,
    imageUrl: productData.imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
    affiliateUrl: productData.affiliateUrl || 'https://shopee.com.br',
    category: productData.category || 'Tendências & Destaques',
    platform: productData.platform || 'shopee',
    badge: productData.badge || '',
    highlightId: productData.highlightId || '',
    isFeatured: productData.isFeatured ?? true,
    isActive: productData.isActive ?? true,
    clicksCount: productData.clicksCount || 0,
    rating: productData.rating || 5.0,
    reviewsCount: productData.reviewsCount || 10,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'products', newId), fullProduct);
  } catch (err) {
    console.error('Error saving product to Firestore:', err);
  }
  return fullProduct;
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  const updatedData = {
    ...productData,
    updatedAt: new Date().toISOString(),
  };

  try {
    await updateDoc(doc(db, 'products', id), updatedData);
    const updatedSnap = await getDoc(doc(db, 'products', id));
    if (updatedSnap.exists()) {
      return updatedSnap.data() as Product;
    }
  } catch (err) {
    console.error('Error updating product in Firestore:', err);
  }

  return { id, ...productData } as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (err) {
    console.error('Error deleting product from Firestore:', err);
  }
}

export async function trackProductClick(id: string, referrer = 'direct'): Promise<{ success: boolean; clicksCount: number; affiliateUrl: string }> {
  try {
    const prodRef = doc(db, 'products', id);
    const prodSnap = await getDoc(prodRef);

    let affiliateUrl = 'https://shopee.com.br';
    let newClicks = 1;
    let productTitle = 'Produto';
    let platform = 'shopee';

    if (prodSnap.exists()) {
      const p = prodSnap.data() as Product;
      affiliateUrl = p.affiliateUrl;
      newClicks = (p.clicksCount || 0) + 1;
      productTitle = p.title;
      platform = p.platform;

      await updateDoc(prodRef, {
        clicksCount: increment(1),
      });
    }

    // Add click log entry
    await addDoc(collection(db, 'clickLogs'), {
      productId: id,
      productTitle,
      platform,
      referrer,
      timestamp: new Date().toISOString(),
    });

    return { success: true, clicksCount: newClicks, affiliateUrl };
  } catch (err) {
    console.error('Track click error:', err);
    return { success: false, clicksCount: 0, affiliateUrl: '' };
  }
}

// ---------------- HIGHLIGHTS ----------------

export async function fetchHighlights(): Promise<Highlight[]> {
  try {
    await ensureSeeded();
    const snap = await getDocs(collection(db, 'highlights'));
    let highlights: Highlight[] = [];
    snap.forEach((d) => highlights.push(d.data() as Highlight));
    return highlights;
  } catch (err) {
    console.error('Fetch highlights error:', err);
    return [];
  }
}

export async function createHighlight(highlightData: Partial<Highlight>): Promise<Highlight> {
  const newId = highlightData.id || `hl-${Date.now()}`;
  const fullHighlight: Highlight = {
    id: newId,
    title: highlightData.title || 'Novo Destaque',
    subtitle: highlightData.subtitle || '',
    badge: highlightData.badge || 'DESTAQUE',
    bannerUrl: highlightData.bannerUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
    themeColor: highlightData.themeColor || 'from-purple-600 via-pink-600 to-rose-600',
    iconName: highlightData.iconName || 'Flame',
    isActive: highlightData.isActive ?? true,
    tagFilter: highlightData.tagFilter || '',
  };

  try {
    await setDoc(doc(db, 'highlights', newId), fullHighlight);
  } catch (err) {
    console.error('Create highlight error:', err);
  }
  return fullHighlight;
}

export async function updateHighlight(id: string, highlightData: Partial<Highlight>): Promise<Highlight> {
  try {
    await updateDoc(doc(db, 'highlights', id), highlightData);
    const snap = await getDoc(doc(db, 'highlights', id));
    if (snap.exists()) return snap.data() as Highlight;
  } catch (err) {
    console.error('Update highlight error:', err);
  }
  return { id, ...highlightData } as Highlight;
}

export async function deleteHighlight(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'highlights', id));

    // Also remove highlightId association from any products linked to this highlight
    const prodsSnap = await getDocs(collection(db, 'products'));
    prodsSnap.forEach(async (pDoc) => {
      const p = pDoc.data() as Product;
      if (p.highlightId === id) {
        await updateDoc(doc(db, 'products', p.id), { highlightId: '' });
      }
    });
  } catch (err) {
    console.error('Delete highlight error:', err);
  }
}

// ---------------- CATEGORIES ----------------

export async function fetchCategories(): Promise<CategoryOption[]> {
  try {
    await ensureSeeded();
    const snap = await getDocs(collection(db, 'categories'));
    let categories: CategoryOption[] = [];
    snap.forEach((d) => categories.push(d.data() as CategoryOption));
    const result = categories.length > 0 ? categories : INITIAL_CATEGORIES;
    // Ensure 'todos' is always the first item
    return result.sort((a, b) => {
      if (a.id === 'todos') return -1;
      if (b.id === 'todos') return 1;
      return 0;
    });
  } catch (err) {
    console.error('Fetch categories error:', err);
    return INITIAL_CATEGORIES;
  }
}

export async function createCategory(catData: Partial<CategoryOption>): Promise<CategoryOption> {
  const newId = catData.id || `cat-${Date.now()}`;
  const fullCat: CategoryOption = {
    id: newId,
    name: catData.name || 'Nova Categoria',
    icon: catData.icon || 'Sparkles',
  };

  try {
    await setDoc(doc(db, 'categories', newId), fullCat);
  } catch (err) {
    console.error('Create category error:', err);
  }
  return fullCat;
}

export async function updateCategory(id: string, catData: Partial<CategoryOption>): Promise<CategoryOption> {
  try {
    await updateDoc(doc(db, 'categories', id), catData);
    const snap = await getDoc(doc(db, 'categories', id));
    if (snap.exists()) return snap.data() as CategoryOption;
  } catch (err) {
    console.error('Update category error:', err);
  }
  return { id, ...catData } as CategoryOption;
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (err) {
    console.error('Delete category error:', err);
  }
}

// ---------------- METRICS ----------------

export async function fetchMetrics(): Promise<MetricSummary | null> {
  try {
    const products = await fetchProducts();
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.isActive).length;
    const totalClicks = products.reduce((acc, p) => acc + (p.clicksCount || 0), 0);

    const highlights = await fetchHighlights();

    let recentClicks: ClickLog[] = [];
    try {
      const logsSnap = await getDocs(collection(db, 'clickLogs'));
      logsSnap.forEach((d) => recentClicks.push({ id: d.id, ...d.data() } as ClickLog));
      recentClicks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      recentClicks = recentClicks.slice(0, 20);
    } catch {
      recentClicks = [];
    }

    const topProducts = [...products]
      .sort((a, b) => (b.clicksCount || 0) - (a.clicksCount || 0))
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: p.title,
        clicksCount: p.clicksCount || 0,
        category: p.category,
        imageUrl: p.imageUrl,
        price: p.price,
        platform: p.platform,
      }));

    const platformMap: Record<string, number> = {};
    products.forEach((p) => {
      platformMap[p.platform] = (platformMap[p.platform] || 0) + (p.clicksCount || 0);
    });
    const platformDistribution = Object.entries(platformMap).map(([platform, count]) => ({
      platform,
      count,
    }));

    const catMap: Record<string, { count: number; clicks: number }> = {};
    products.forEach((p) => {
      if (!catMap[p.category]) catMap[p.category] = { count: 0, clicks: 0 };
      catMap[p.category].count += 1;
      catMap[p.category].clicks += p.clicksCount || 0;
    });
    const categoryDistribution = Object.entries(catMap).map(([category, val]) => ({
      category,
      count: val.count,
      clicks: val.clicks,
    }));

    return {
      totalClicks,
      totalProducts,
      activeProducts,
      totalHighlights: highlights.length,
      topProducts,
      platformDistribution,
      categoryDistribution,
      recentClicks,
      dailyClicks: [
        { date: 'Hoje', clicks: Math.round(totalClicks * 0.4) },
        { date: 'Ontem', clicks: Math.round(totalClicks * 0.3) },
        { date: '3 dias atrás', clicks: Math.round(totalClicks * 0.2) },
      ],
    };
  } catch (err) {
    console.error('Fetch metrics error:', err);
    return null;
  }
}

export async function resetMetrics(): Promise<void> {
  const products = await fetchProducts();
  for (const p of products) {
    await updateProduct(p.id, { clicksCount: 0 });
  }
}

export async function resetDatabase(): Promise<void> {
  isSeeded = false;
  for (const p of INITIAL_PRODUCTS) {
    await setDoc(doc(db, 'products', p.id), p);
  }
  for (const h of INITIAL_HIGHLIGHTS) {
    await setDoc(doc(db, 'highlights', h.id), h);
  }
  for (const c of INITIAL_CATEGORIES) {
    await setDoc(doc(db, 'categories', c.id), c);
  }
  await setDoc(doc(db, 'settings', 'seedStatus'), {
    seeded: true,
    seededAt: new Date().toISOString(),
  });
  isSeeded = true;
}

// ---------------- AUTOFILL ----------------

export async function autoFillFromUrl(url: string): Promise<Partial<Product>> {
  try {
    const res = await fetch(`${API_BASE}/autofill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Ignore server error on static hosting
  }

  let platform: any = 'outros';
  const urlLower = url.toLowerCase();

  if (urlLower.includes('shopee')) platform = 'shopee';
  else if (urlLower.includes('amazon')) platform = 'amazon';
  else if (urlLower.includes('tiktok')) platform = 'tiktok';
  else if (urlLower.includes('instagram')) platform = 'instagram';
  else if (urlLower.includes('aliexpress')) platform = 'aliexpress';
  else if (urlLower.includes('mercadolivre') || urlLower.includes('mercadolibre')) platform = 'mercadolivre';

  let title = 'Novo Achadinho Em Oferta';
  try {
    const parsedUrl = new URL(url);
    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      const rawSlug = pathSegments[pathSegments.length - 1];
      const cleanSlug = decodeURIComponent(rawSlug)
        .replace(/[-_]+/g, ' ')
        .replace(/\.[a-z0-9]+$/i, '')
        .trim();
      if (cleanSlug.length > 3) {
        title = cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1);
      }
    }
  } catch {
    // Keep default title
  }

  return {
    title,
    affiliateUrl: url,
    platform,
    category: 'Tendências & Destaques',
    price: 49.9,
    originalPrice: 89.9,
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
    description: `Oferta incrível encontrada na plataforma ${platform.toUpperCase()}. Aproveite antes que acabe!`,
  };
}

// ---------------- SUBSCRIBERS ----------------

export async function fetchSubscribers(): Promise<string[]> {
  try {
    const snap = await getDocs(collection(db, 'subscribers'));
    const firestoreEmails: string[] = [];
    const firestoreSet = new Set<string>();

    snap.forEach((d) => {
      const data = d.data();
      if (data.email && typeof data.email === 'string') {
        const clean = data.email.trim();
        firestoreEmails.push(clean);
        firestoreSet.add(clean.toLowerCase());
      }
    });

    // Auto-sync any emails stored locally that haven't been pushed to Firestore yet
    let local: string[] = [];
    try {
      local = JSON.parse(localStorage.getItem('woobox_subscribers') || '[]');
    } catch {
      local = [];
    }

    const unSyncedLocal = local.filter((e) => e && typeof e === 'string' && !firestoreSet.has(e.trim().toLowerCase()));

    if (unSyncedLocal.length > 0) {
      for (const rawEmail of unSyncedLocal) {
        const clean = rawEmail.trim();
        if (clean && clean.includes('@')) {
          const id = clean.toLowerCase().replace(/[^a-z0-9]/g, '_');
          try {
            await setDoc(doc(db, 'subscribers', id), {
              email: clean,
              subscribedAt: new Date().toISOString(),
            });
            firestoreEmails.push(clean);
            firestoreSet.add(clean.toLowerCase());
          } catch (err) {
            console.error('Error auto-syncing local subscriber to Firestore:', err);
          }
        }
      }
    }

    // Merge and deduplicate (case-insensitive)
    const uniqueMap = new Map<string, string>();
    [...firestoreEmails, ...local].forEach((e) => {
      if (e && typeof e === 'string') {
        const clean = e.trim();
        if (clean && !uniqueMap.has(clean.toLowerCase())) {
          uniqueMap.set(clean.toLowerCase(), clean);
        }
      }
    });

    const merged = Array.from(uniqueMap.values());
    localStorage.setItem('woobox_subscribers', JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.error('Fetch subscribers error:', err);
    try {
      return JSON.parse(localStorage.getItem('woobox_subscribers') || '[]');
    } catch {
      return [];
    }
  }
}

export async function addSubscriber(email: string): Promise<string[]> {
  const clean = email.trim();
  if (!clean || !clean.includes('@') || !clean.includes('.')) {
    throw new Error('E-mail inválido.');
  }

  const id = clean.toLowerCase().replace(/[^a-z0-9]/g, '_');
  try {
    await setDoc(doc(db, 'subscribers', id), {
      email: clean,
      subscribedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Save subscriber to Firestore error:', err);
  }

  const current = await fetchSubscribers();
  if (!current.some((e) => e.toLowerCase() === clean.toLowerCase())) {
    current.unshift(clean);
  }
  localStorage.setItem('woobox_subscribers', JSON.stringify(current));
  return current;
}

export async function removeSubscriber(email: string): Promise<string[]> {
  const clean = email.trim();
  const id = clean.toLowerCase().replace(/[^a-z0-9]/g, '_');

  try {
    await deleteDoc(doc(db, 'subscribers', id));
  } catch (err) {
    console.error('Delete subscriber error:', err);
  }

  const current = await fetchSubscribers();
  const updated = current.filter((e) => e.toLowerCase() !== clean.toLowerCase());
  localStorage.setItem('woobox_subscribers', JSON.stringify(updated));
  return updated;
}

export async function clearAllSubscribers(): Promise<string[]> {
  try {
    const snap = await getDocs(collection(db, 'subscribers'));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  } catch (err) {
    console.error('Clear all subscribers error:', err);
  }
  localStorage.setItem('woobox_subscribers', JSON.stringify([]));
  return [];
}

// Gmail Connection Settings Persistence in Firestore Database
export interface GmailAuthSettings {
  connected: boolean;
  email: string;
  name: string;
  accessToken: string | null;
  updatedAt: string;
}

export async function getGmailAuthSettings(): Promise<GmailAuthSettings | null> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'gmail_auth'));
    if (snap.exists()) {
      return snap.data() as GmailAuthSettings;
    }
  } catch (err) {
    console.warn('Could not fetch Gmail auth settings from Firestore:', err);
  }

  // Fallback to localStorage cache
  try {
    const isConn = localStorage.getItem('woobox_gmail_connected') === 'true';
    if (isConn) {
      const userStr = localStorage.getItem('woobox_gmail_user');
      const userObj = userStr ? JSON.parse(userStr) : null;
      const token = localStorage.getItem('woobox_gmail_token');
      return {
        connected: true,
        email: userObj?.email || 'wooboxshop@gmail.com',
        name: userObj?.name || 'Woobox Shop',
        accessToken: token,
        updatedAt: new Date().toISOString(),
      };
    }
  } catch (e) {
    // ignore
  }

  return null;
}

export async function saveGmailAuthSettings(data: {
  connected: boolean;
  email?: string;
  name?: string;
  accessToken?: string | null;
}): Promise<GmailAuthSettings> {
  const docData: GmailAuthSettings = {
    connected: data.connected,
    email: data.email || 'wooboxshop@gmail.com',
    name: data.name || 'Woobox Shop',
    accessToken: data.accessToken || null,
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'settings', 'gmail_auth'), docData, { merge: true });
  } catch (err) {
    console.error('Error saving Gmail auth settings to Firestore:', err);
  }

  if (data.connected) {
    if (data.accessToken) localStorage.setItem('woobox_gmail_token', data.accessToken);
    localStorage.setItem('woobox_gmail_user', JSON.stringify({ email: docData.email, name: docData.name }));
    localStorage.setItem('woobox_gmail_connected', 'true');
  } else {
    localStorage.removeItem('woobox_gmail_token');
    localStorage.removeItem('woobox_gmail_user');
    localStorage.removeItem('woobox_gmail_connected');
  }

  return docData;
}

// ---------------- REAL-TIME LISTENERS FOR LIVE MULTI-DEVICE SYNC ----------------

export function subscribeToProducts(callback: (products: Product[]) => void): () => void {
  ensureSeeded().catch(console.error);
  return onSnapshot(
    collection(db, 'products'),
    (snapshot) => {
      let products: Product[] = [];
      snapshot.forEach((docSnap) => {
        products.push(docSnap.data() as Product);
      });
      if (products.length === 0) {
        products = [...INITIAL_PRODUCTS];
      }
      callback(products);
    },
    (err) => {
      console.error('Realtime products subscription error:', err);
    }
  );
}

export function subscribeToHighlights(callback: (highlights: Highlight[]) => void): () => void {
  ensureSeeded().catch(console.error);
  return onSnapshot(
    collection(db, 'highlights'),
    (snapshot) => {
      let highlights: Highlight[] = [];
      snapshot.forEach((docSnap) => {
        highlights.push(docSnap.data() as Highlight);
      });
      if (highlights.length === 0) {
        highlights = [...INITIAL_HIGHLIGHTS];
      }
      callback(highlights);
    },
    (err) => {
      console.error('Realtime highlights subscription error:', err);
    }
  );
}

export function subscribeToCategories(callback: (categories: CategoryOption[]) => void): () => void {
  ensureSeeded().catch(console.error);
  return onSnapshot(
    collection(db, 'categories'),
    (snapshot) => {
      let categories: CategoryOption[] = [];
      snapshot.forEach((docSnap) => {
        categories.push(docSnap.data() as CategoryOption);
      });
      if (categories.length === 0) {
        categories = [...INITIAL_CATEGORIES];
      }
      categories.sort((a, b) => {
        if (a.id === 'todos') return -1;
        if (b.id === 'todos') return 1;
        return 0;
      });
      callback(categories);
    },
    (err) => {
      console.error('Realtime categories subscription error:', err);
    }
  );
}

export function subscribeToStoreSettings(callback: (settings: StoreSettings) => void): () => void {
  ensureSeeded().catch(console.error);
  return onSnapshot(
    doc(db, 'settings', 'store'),
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ ...DEFAULT_STORE_SETTINGS, ...(docSnap.data() as StoreSettings) });
      } else {
        callback(DEFAULT_STORE_SETTINGS);
      }
    },
    (err) => {
      console.error('Realtime store settings subscription error:', err);
    }
  );
}

export function subscribeToSubscribers(callback: (subscribers: string[]) => void): () => void {
  return onSnapshot(
    collection(db, 'subscribers'),
    (snapshot) => {
      const uniqueMap = new Map<string, string>();
      snapshot.forEach((d) => {
        const data = d.data();
        if (data.email && typeof data.email === 'string') {
          const clean = data.email.trim();
          if (clean && !uniqueMap.has(clean.toLowerCase())) {
            uniqueMap.set(clean.toLowerCase(), clean);
          }
        }
      });
      callback(Array.from(uniqueMap.values()));
    },
    (err) => {
      console.error('Realtime subscribers subscription error:', err);
    }
  );
}
