import React from 'react';
import { Highlight, StoreSettings, DEFAULT_STORE_SETTINGS } from '../types';
import { ArrowRight, ShieldCheck, Tag, Sparkles } from 'lucide-react';

interface BannerSectionProps {
  highlights: Highlight[];
  selectedHighlightId: string | null;
  onSelectHighlight: (id: string | null) => void;
  onExploreClick?: () => void;
  storeSettings?: StoreSettings;
}

export const BannerSection: React.FC<BannerSectionProps> = ({
  highlights,
  selectedHighlightId,
  onSelectHighlight,
  onExploreClick,
  storeSettings = DEFAULT_STORE_SETTINGS,
}) => {
  const promoHighlight = highlights.find((h) => h.isActive) || highlights[0];

  return (
    <section className="mb-4 space-y-3">
      {/* Compact Main Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0d0c14] border border-zinc-800 p-4 sm:p-5 shadow-lg">
        
        {/* Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[120px] bg-pink-600/10 blur-[80px] pointer-events-none rounded-full" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Left: Brand Identity & Concise Headline */}
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <img
              src={storeSettings.logoUrl || DEFAULT_STORE_SETTINGS.logoUrl}
              alt={storeSettings.storeName || DEFAULT_STORE_SETTINGS.storeName}
              className="w-12 h-12 rounded-2xl object-cover ring-1 ring-pink-500/40 shadow-md shrink-0 hidden xs:block"
              referrerPolicy="no-referrer"
            />
            
            <div className="space-y-0.5">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-black uppercase tracking-wider border border-pink-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-pink-400" />
                  {storeSettings.badgeTag1 || 'Curadoria Exclusiva'}
                </span>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {storeSettings.badgeTag2 || 'Ofertas Verificadas'}
                </span>
              </div>

              <h1 className="text-base sm:text-xl font-black text-white tracking-tight leading-tight">
                {storeSettings.bannerHeadline || 'Os melhores produtos reunidos com os'}{' '}
                <span className="text-pink-400">
                  {storeSettings.bannerHeadlineGradient || 'melhores preços.'}
                </span>
              </h1>
            </div>
          </div>

          {/* Right: Quick CTA & Promo Pill */}
          <div className="flex items-center gap-2 shrink-0">
            {promoHighlight && (
              <button
                onClick={() => onSelectHighlight(selectedHighlightId === promoHighlight.id ? null : promoHighlight.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  selectedHighlightId === promoHighlight.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">{promoHighlight.title}</span>
                <span className="text-amber-400 font-extrabold">{storeSettings.promoPillText || 'Até 40% OFF'}</span>
              </button>
            )}

            <button
              onClick={onExploreClick}
              className="px-4 py-2 bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <span>Explorar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

