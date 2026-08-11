export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function calculateDiscount(price: number, originalPrice?: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getPlatformBadgeColor(platform: string): { bg: string; text: string; border: string; label: string } {
  switch (platform.toLowerCase()) {
    case 'tiktok':
      return {
        bg: 'bg-zinc-900',
        text: 'text-cyan-400',
        border: 'border-pink-500/30',
        label: 'TikTok Shop',
      };
    case 'instagram':
      return {
        bg: 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500',
        text: 'text-white',
        border: 'border-pink-300/40',
        label: 'Instagram',
      };
    case 'shopee':
      return {
        bg: 'bg-orange-500',
        text: 'text-white',
        border: 'border-orange-400/30',
        label: 'Shopee',
      };
    case 'amazon':
      return {
        bg: 'bg-amber-500',
        text: 'text-slate-950',
        border: 'border-amber-400/30',
        label: 'Amazon',
      };
    case 'mercadolivre':
      return {
        bg: 'bg-yellow-400',
        text: 'text-slate-900',
        border: 'border-yellow-300/40',
        label: 'Mercado Livre',
      };
    case 'aliexpress':
      return {
        bg: 'bg-red-600',
        text: 'text-white',
        border: 'border-red-500/30',
        label: 'AliExpress',
      };
    default:
      return {
        bg: 'bg-pink-600',
        text: 'text-white',
        border: 'border-pink-500/30',
        label: 'Afiliado Oficial',
      };
  }
}
