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
  badge?: string;
  badgeIcon?: string; // Icon name from the shared icon set (same as category icons)
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
  updatedAt?: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Woobox Shop',
  storeSlogan: 'O Seu Guia de Achadinhos e Ofertas Secretas',
  logoUrl: 'https://i.pinimg.com/280x280_RS/44/4a/ed/444aed68b0abf3f41e9707e9d2c8c22d.jpg',
  bannerHeadline: 'Os melhores produtos reunidos com os',
  bannerHeadlineGradient: 'melhores preços.',
  bannerGradientFrom: '#fbbf24',
  bannerGradientTo: '#fb7185',
  badgeTag1: 'Curadoria Exclusiva',
  badgeTag2: 'Ofertas Verificadas',
  promoPillText: 'Até 40% OFF',
  topNoticeText: '',
  themePrimaryColor: '#ec4899',
  themeAccentColor: '#f59e0b',
};

