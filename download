import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  increment,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Product,
  Highlight,
  CategoryOption,
  StoreSettings,
  DEFAULT_STORE_SETTINGS,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_HIGHLIGHTS,
  INITIAL_CATEGORIES,
} from '../data/initialData';

// Public storefront API only.
// Catalog/settings writes and administration belong to the separate admin application.

export async function trackProductClick(
  id: string,
  referrer = 'direct',
): Promise<{ success: boolean; clicksCount: number; affiliateUrl: string }> {
  try {
    const prodRef = doc(db, 'products', id);
    const prodSnap = await getDoc(prodRef);

    let affiliateUrl = 'https://shopee.com.br';
    let newClicks = 1;
    let productTitle = 'Produto';
    let platform = 'shopee';

    if (prodSnap.exists()) {
      const p = prodSnap.data() as Product;
      affiliateUrl = p.affiliateUrl || affiliateUrl;
      newClicks = (p.clicksCount || 0) + 1;
      productTitle = p.title;
      platform = p.platform;

      await updateDoc(prodRef, { clicksCount: increment(1) });
    }

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

  const current = (() => {
    try {
      return JSON.parse(localStorage.getItem('woobox_subscribers') || '[]') as string[];
    } catch {
      return [];
    }
  })();

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

  let current: string[] = [];
  try {
    current = JSON.parse(localStorage.getItem('woobox_subscribers') || '[]');
  } catch {
    current = [];
  }

  const updated = current.filter((e) => e.toLowerCase() !== clean.toLowerCase());
  localStorage.setItem('woobox_subscribers', JSON.stringify(updated));
  return updated;
}

export function subscribeToProducts(callback: (products: Product[]) => void): () => void {
  return onSnapshot(
    collection(db, 'products'),
    (snapshot) => {
      let products: Product[] = [];
      snapshot.forEach((docSnap) => products.push(docSnap.data() as Product));

      if (products.length === 0) {
        products = [...INITIAL_PRODUCTS];
      }

      callback(products);
    },
    (err) => {
      console.error('Realtime products subscription error:', err);
      callback([...INITIAL_PRODUCTS]);
    },
  );
}

export function subscribeToHighlights(callback: (highlights: Highlight[]) => void): () => void {
  return onSnapshot(
    collection(db, 'highlights'),
    (snapshot) => {
      let highlights: Highlight[] = [];
      snapshot.forEach((docSnap) => highlights.push(docSnap.data() as Highlight));

      if (highlights.length === 0) {
        highlights = [...INITIAL_HIGHLIGHTS];
      }

      callback(highlights);
    },
    (err) => {
      console.error('Realtime highlights subscription error:', err);
      callback([...INITIAL_HIGHLIGHTS]);
    },
  );
}

export function subscribeToCategories(callback: (categories: CategoryOption[]) => void): () => void {
  return onSnapshot(
    collection(db, 'categories'),
    (snapshot) => {
      let categories: CategoryOption[] = [];
      snapshot.forEach((docSnap) => categories.push(docSnap.data() as CategoryOption));

      const result = categories.length > 0 ? categories : [...INITIAL_CATEGORIES];
      result.sort((a, b) => {
        if (a.id === 'todos') return -1;
        if (b.id === 'todos') return 1;
        return 0;
      });

      callback(result);
    },
    (err) => {
      console.error('Realtime categories subscription error:', err);
      callback([...INITIAL_CATEGORIES]);
    },
  );
}

export function subscribeToStoreSettings(callback: (settings: StoreSettings) => void): () => void {
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
      callback(DEFAULT_STORE_SETTINGS);
    },
  );
}
