import React from 'react';
import { Handshake, Instagram, Music2, Package, ShoppingBag, Store, Tag, type LucideIcon } from 'lucide-react';
import { PlatformType } from '../types';

interface PlatformMarkProps {
  platform: PlatformType;
  compact?: boolean;
}

const config: Record<PlatformType, { label: string; className: string; Icon: LucideIcon }> = {
  shopee: { label: 'Shopee', className: 'bg-orange-500 text-white', Icon: ShoppingBag },
  mercadolivre: { label: 'Mercado Livre', className: 'bg-yellow-400 text-zinc-950', Icon: Handshake },
  tiktok: { label: 'TikTok Shop', className: 'bg-zinc-950 text-cyan-300', Icon: Music2 },
  instagram: { label: 'Instagram', className: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white', Icon: Instagram },
  amazon: { label: 'Amazon', className: 'bg-amber-400 text-zinc-950', Icon: Package },
  aliexpress: { label: 'AliExpress', className: 'bg-red-500 text-white', Icon: Tag },
  outros: { label: 'Afiliado', className: 'bg-zinc-800 text-zinc-100', Icon: Store },
};

export const PlatformMark: React.FC<PlatformMarkProps> = ({ platform, compact = false }) => {
  const item = config[platform] || config.outros;
  const Icon = item.Icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border border-white/10 shadow-sm ${item.className} ${compact ? 'px-1.5 py-1' : 'px-2 py-1'}`}>
      <span className="grid place-items-center rounded-md bg-black/15 w-4 h-4 shrink-0">
        <Icon className="w-3 h-3" strokeWidth={2.6} />
      </span>
      <span className="text-[9px] font-black uppercase tracking-wide whitespace-nowrap">{item.label}</span>
    </span>
  );
};
