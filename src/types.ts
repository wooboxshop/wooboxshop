export type PlatformType = 'tiktok' | 'instagram' | 'shopee' | 'amazon' | 'aliexpress' | 'mercadolivre' | 'outros';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  gallery?: string[];
  affiliateUrl: string;
  category: string;
  platform: PlatformType;
  /** @deprecated Legacy Firestore field; the storefront no longer renders product tags. */
  badge?: string;
  /** @deprecated Legacy Firestore field; the storefront no longer renders product tags. */
  badgeIcon?: string;
  hasFreeShipping?: boolean; // Product characteristic (like price) — rendered as a plain indicator, never as a badge/selo
  highlightId?: string; // Links product to special events like "dia-dos-pais", "dia-dos-namorados"
  isFeatured: boolean;
  isActive: boolean;
  clicksCount: number;
  rating: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Highlight {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  bannerUrl: string;
  themeColor: string; // Tailwind gradient class or color code
  iconName?: string;
  isActive: boolean;
  tagFilter?: string; // Optional filter string
  productIds?: string[];
}

export interface ClickLog {
  id: string;
  productId: string;
  productTitle: string;
  platform: PlatformType;
  timestamp: string;
  referrer?: string;
  userAgent?: string;
}

export interface MetricSummary {
  totalClicks: number;
  totalProducts: number;
  activeProducts: number;
  totalHighlights: number;
  topProducts: {
    id: string;
    title: string;
    clicksCount: number;
    category: string;
    imageUrl: string;
    price: number;
    platform: PlatformType;
  }[];
  platformDistribution: {
    platform: string;
    count: number;
  }[];
  categoryDistribution: {
    category: string;
    count: number;
    clicks: number;
  }[];
  recentClicks: ClickLog[];
  dailyClicks: {
    date: string;
    clicks: number;
  }[];
}

export interface CategoryOption {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

export interface StoreSettings {
  storeName: string;
  storeSlogan: string;
  logoUrl: string;
  bannerHeadline: string;
  bannerHeadlineGradient: string;
  bannerGradientFrom?: string; // Gradient starting hex color (e.g. #fbbf24)
  bannerGradientTo?: string; // Gradient ending hex color (e.g. #fb7185)
  badgeTag1: string;
  badgeTag2: string;
  promoPillText: string;
  topNoticeText?: string;
  themePrimaryColor?: string; // Main brand color (buttons, links, active states)
  themeAccentColor?: string; // Secondary brand color (gradients, highlights)
  themeOfferButtonColor?: string; // Main affiliate CTA background color
  updatedAt?: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Woobox Shop',
  storeSlogan: 'O Seu Guia de Achadinhos e Ofertas Secretas',
  logoUrl: `${import.meta.env.BASE_URL}wooboxlogo.svg`,
  bannerHeadline: 'Os melhores produtos reunidos com os',
  bannerHeadlineGradient: 'melhores preços.',
  bannerGradientFrom: '#22d3ee',
  bannerGradientTo: '#34d399',
  badgeTag1: 'Curadoria Exclusiva',
  badgeTag2: 'Ofertas Verificadas',
  promoPillText: 'Até 40% OFF',
  topNoticeText: '',
  themePrimaryColor: '#22d3ee',
  themeAccentColor: '#34d399',
  themeOfferButtonColor: '#ffffff',
};

export function normalizeStoreSettingsTheme(settings: StoreSettings): StoreSettings {
  const primary = settings.themePrimaryColor?.toLowerCase();
  const accent = settings.themeAccentColor?.toLowerCase();
  const legacyLogoUrl = 'https://i.pinimg.com/280x280_RS/44/4a/ed/444aed68b0abf3f41e9707e9d2c8c22d.jpg';

  return {
    ...settings,
    logoUrl: !settings.logoUrl || settings.logoUrl === legacyLogoUrl
      ? DEFAULT_STORE_SETTINGS.logoUrl
      : settings.logoUrl,
    themePrimaryColor: !primary || primary === '#ec4899' ? DEFAULT_STORE_SETTINGS.themePrimaryColor : settings.themePrimaryColor,
    themeAccentColor: !accent || accent === '#f59e0b' || accent === '#8b5cf6' ? DEFAULT_STORE_SETTINGS.themeAccentColor : settings.themeAccentColor,
    themeOfferButtonColor: settings.themeOfferButtonColor || DEFAULT_STORE_SETTINGS.themeOfferButtonColor,
  };
}

export function getReadableTextColor(hexColor?: string): '#09090d' | '#ffffff' {
  const normalized = (hexColor || '#ffffff').replace('#', '');
  const hex = normalized.length === 3
    ? normalized.split('').map((character) => character + character).join('')
    : normalized;
  if (!/^[0-9a-f]{6}$/i.test(hex)) return '#09090d';

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;
  return luminance > 150 ? '#09090d' : '#ffffff';
}
