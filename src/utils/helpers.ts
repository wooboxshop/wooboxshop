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

export function getPlatformBadgeColor(platform: string): { bg: string; text: string; border: string; label: string; shortLabel: string; prep: string } {
  switch (platform.toLowerCase()) {
    case 'tiktok':
      return {
        bg: 'bg-zinc-950/90',
        text: 'text-cyan-300',
        border: 'border-cyan-500/30',
        label: 'TikTok Shop',
        shortLabel: 'TikTok',
        prep: 'no',
      };
    case 'instagram':
      return {
        bg: 'bg-zinc-950/90',
        text: 'text-pink-300',
        border: 'border-pink-300/40',
        label: 'Instagram',
        shortLabel: 'Insta',
        prep: 'no',
      };
    case 'shopee':
      return {
        bg: 'bg-zinc-950/90',
        text: 'text-orange-300',
        border: 'border-orange-400/30',
        label: 'Shopee',
        shortLabel: 'Shopee',
        prep: 'na',
      };
    case 'amazon':
      return {
        bg: 'bg-zinc-950/90',
        text: 'text-amber-300',
        border: 'border-amber-400/30',
        label: 'Amazon',
        shortLabel: 'Amazon',
        prep: 'na',
      };
    case 'mercadolivre':
      return {
        bg: 'bg-zinc-950/90',
        text: 'text-yellow-300',
        border: 'border-yellow-300/40',
        label: 'Mercado Livre',
        shortLabel: 'M.Livre',
        prep: 'no',
      };
    case 'aliexpress':
      return {
        bg: 'bg-zinc-950/90',
        text: 'text-red-300',
        border: 'border-red-500/30',
        label: 'AliExpress',
        shortLabel: 'AliEx',
        prep: 'no',
      };
    default:
      return {
        bg: 'bg-zinc-950/90',
        text: 'text-pink-300',
        border: 'border-pink-500/30',
        label: 'Afiliado Oficial',
        shortLabel: 'Loja',
        prep: 'na',
      };
  }
}
