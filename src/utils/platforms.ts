import { PlatformType } from '../types';

export interface StorePlatform {
  id: PlatformType;
  label: string;
}

export const STORE_PLATFORMS: StorePlatform[] = [
  { id: 'mercadolivre', label: 'Mercado Livre' },
  { id: 'shopee', label: 'Shopee' },
  { id: 'tiktok', label: 'TikTok Shop' },
  { id: 'amazon', label: 'Amazon' },
  { id: 'aliexpress', label: 'AliExpress' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'outros', label: 'Outras lojas' },
];

