import React, { useState } from 'react';
import { Product } from '../types';
import { X, Check, Copy, Share2, Send, Instagram, MessageCircle, Facebook, Globe } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

interface ShareModalProps {
  product: Product | null;
  isOpen?: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ product, isOpen = true, onClose }) => {
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const shareUrl = product.affiliateUrl || window.location.href;
  const shareText = `Confira "${product.title}" na WOOBOX SHOP por apenas ${formatCurrency(product.price)}!`;

  const handleCopyLink = (label: string, textToCopy: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedStatus(label);
      setTimeout(() => setCopiedStatus(null), 3000);
    }
  };

  const handleWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(waUrl, '_blank');
  };

  const handleTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(tgUrl, '_blank');
  };

  const handleFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank');
  };

  const handleInstagram = () => {
    handleCopyLink('instagram', `${shareText}\n${shareUrl}`);
    setTimeout(() => {
      window.open('https://www.instagram.com/', '_blank');
    }, 1000);
  };

  const handleTikTok = () => {
    handleCopyLink('tiktok', `${shareText}\n${shareUrl}`);
    setTimeout(() => {
      window.open('https://www.tiktok.com/', '_blank');
    }, 1000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: shareText,
        url: shareUrl,
      }).catch(() => {
        handleCopyLink('link', shareUrl);
      });
    } else {
      handleCopyLink('link', shareUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative bg-[#0d0c15] text-zinc-100 w-full max-w-md rounded-3xl shadow-2xl p-6 border border-zinc-800 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-500/10 text-pink-400 rounded-2xl border border-pink-500/20">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Compartilhar Produto</h3>
            <p className="text-xs text-zinc-400">Escolha onde deseja enviar a oferta</p>
          </div>
        </div>

        {/* Product Card Preview */}
        <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-14 h-14 object-cover rounded-xl shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white line-clamp-1">{product.title}</h4>
            <p className="text-sm font-black text-amber-400 mt-0.5">{formatCurrency(product.price)}</p>
          </div>
        </div>

        {/* Status Notification */}
        {copiedStatus && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {copiedStatus === 'link' && 'Link do produto copiado com sucesso!'}
              {copiedStatus === 'instagram' && 'Texto e link copiados! Abrindo Instagram...'}
              {copiedStatus === 'tiktok' && 'Texto e link copiados! Abrindo TikTok...'}
            </span>
          </div>
        )}

        {/* Share Options Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="p-3 bg-[#128C7E]/20 hover:bg-[#128C7E]/30 border border-[#25D366]/40 rounded-2xl flex flex-col items-center gap-1.5 text-white transition-all group cursor-pointer"
          >
            <div className="p-2.5 bg-[#25D366] text-zinc-950 rounded-xl font-bold group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.233-1.237a9.98 9.98 0 0 0 4.779 1.221h.004c5.505 0 9.988-4.478 9.989-9.984a9.98 9.98 0 0 0-9.993-10zm0 18.261h-.003a8.28 8.28 0 0 1-4.225-1.161l-.303-.18-3.138.742.753-3.057-.197-.314a8.27 8.27 0 0 1-1.272-4.307c0-4.568 3.718-8.284 8.288-8.284a8.26 8.26 0 0 1 5.856 2.428 8.25 8.25 0 0 1 2.424 5.859c0 4.569-3.719 8.284-8.287 8.284zm4.542-6.208c-.249-.125-1.472-.726-1.7-.809-.228-.083-.394-.125-.56.125-.166.249-.644.809-.789.975-.145.166-.29.187-.539.062a6.8 6.8 0 0 1-2.001-1.233 7.5 7.5 0 0 1-1.385-1.724c-.145-.249-.016-.384.109-.508.112-.112.249-.29.373-.435.124-.145.166-.249.249-.415.083-.166.042-.311-.021-.435-.062-.125-.56-1.349-.768-1.847-.202-.486-.408-.42-.56-.428l-.478-.008c-.166 0-.435.062-.663.311s-.871.851-.871 2.076c0 1.224.892 2.407 1.016 2.573.124.166 1.756 2.682 4.254 3.762.595.257 1.06.41 1.423.526.598.19 1.142.163 1.572.099.48-.071 1.472-.602 1.679-1.183.207-.581.207-1.079.145-1.183-.062-.104-.228-.187-.477-.312z" />
              </svg>
            </div>
            <span className="text-[11px] font-bold">WhatsApp</span>
          </button>

          {/* Instagram */}
          <button
            onClick={handleInstagram}
            className="p-3 bg-gradient-to-tr from-purple-900/30 via-pink-900/30 to-rose-900/30 hover:brightness-125 border border-pink-500/40 rounded-2xl flex flex-col items-center gap-1.5 text-white transition-all group cursor-pointer"
          >
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white rounded-xl group-hover:scale-110 transition-transform">
              <Instagram className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold">Instagram</span>
          </button>

          {/* TikTok */}
          <button
            onClick={handleTikTok}
            className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-2xl flex flex-col items-center gap-1.5 text-white transition-all group cursor-pointer"
          >
            <div className="p-2.5 bg-zinc-950 text-white border border-zinc-700 rounded-xl group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.65 6.34 6.34 0 0 0 9.35 22a6.33 6.33 0 0 0 6.32-6.33V9.17a8.16 8.16 0 0 0 3.92 1V6.69z" />
              </svg>
            </div>
            <span className="text-[11px] font-bold">TikTok</span>
          </button>

          {/* Telegram */}
          <button
            onClick={handleTelegram}
            className="p-3 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/40 rounded-2xl flex flex-col items-center gap-1.5 text-white transition-all group cursor-pointer"
          >
            <div className="p-2.5 bg-sky-500 text-white rounded-xl font-bold group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
            </div>
            <span className="text-[11px] font-bold">Telegram</span>
          </button>

          {/* Facebook */}
          <button
            onClick={handleFacebook}
            className="p-3 bg-blue-900/20 hover:bg-blue-900/30 border border-blue-600/40 rounded-2xl flex flex-col items-center gap-1.5 text-white transition-all group cursor-pointer"
          >
            <div className="p-2.5 bg-blue-600 text-white rounded-xl font-bold group-hover:scale-110 transition-transform">
              <Facebook className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold">Facebook</span>
          </button>

          {/* Outros / Native */}
          <button
            onClick={handleNativeShare}
            className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-2xl flex flex-col items-center gap-1.5 text-white transition-all group cursor-pointer"
          >
            <div className="p-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl group-hover:scale-110 transition-transform">
              <Globe className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold">Outros</span>
          </button>
        </div>

        {/* Copy Link Direct Button */}
        <button
          onClick={() => handleCopyLink('link', shareUrl)}
          className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer hover:border-pink-500/50"
        >
          <Copy className="w-4 h-4 text-pink-400" />
          <span>Copiar Link Direto do Produto</span>
        </button>

        {/* Footer info */}
        <div className="pt-1 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border border-zinc-800"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
