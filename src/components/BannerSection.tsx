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
  // Only show a highlight that is explicitly marked active. Previously this fell
  // back to `highlights[0]` regardless of its active state, which meant a
  // deactivated (or even fully removed-from-rotation) highlight would keep
  // showing up on the storefront with no way to turn it off from the admin
  // panel. Now, disabling every highlight correctly hides this pill.
  const promoHighlight = highlights.find((h) => h.isActive);

  return (
    <section className="mb-2 sm:mb-5">
      {/* Premium Curated Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#14121e] to-[#0c0b12] border border-zinc-800/80 p-4 sm:p-6 shadow-xl">
        
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[var(--wb-primary)]/10 blur-[90px] pointer-events-none rounded-full" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[var(--wb-accent)]/10 blur-[90px] pointer-events-none rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Brand Identity & Concise Headline */}
          <div className="flex min-w-0 items-center gap-3.5 sm:gap-4 text-left">
            <div className="relative shrink-0 hidden xs:block">
              <img
                src={storeSettings.logoUrl || DEFAULT_STORE_SETTINGS.logoUrl}
                alt={storeSettings.storeName || DEFAULT_STORE_SETTINGS.storeName}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover ring-1 ring-zinc-700/70 shadow-lg"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-zinc-900 rounded-full ring-1 ring-zinc-800 text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>
            
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--wb-primary)]/15 text-[var(--wb-primary-light)] text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-[var(--wb-primary)]/30 flex items-center gap-1.5 whitespace-nowrap">
                  <Sparkles className="w-3 h-3 text-[var(--wb-primary-light)]" />
                  {storeSettings.badgeTag1 || 'Curadoria Exclusiva'}
                </span>
                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> {storeSettings.badgeTag2 || 'Ofertas Verificadas'}
                </span>
              </div>

              <h1 className="text-sm sm:text-lg md:text-xl font-black text-white tracking-tight leading-snug">
                {storeSettings.bannerHeadline || 'Os melhores produtos reunidos com os'}{' '}
                <span
                  className="font-black inline-block bg-gradient-to-r from-[var(--wb-primary-light)] via-[var(--wb-primary)] to-[var(--wb-accent)] bg-clip-text text-transparent"
                >
                  {storeSettings.bannerHeadlineGradient || 'melhores preços.'}
                </span>
              </h1>
            </div>
          </div>

          {/* Right: Quick CTA & Promo Pill */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            {promoHighlight && (
              <button
                onClick={() => onSelectHighlight(selectedHighlightId === promoHighlight.id ? null : promoHighlight.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedHighlightId === promoHighlight.id
                    ? 'bg-[var(--wb-accent)]/20 border-[var(--wb-accent)] text-[var(--wb-accent)] shadow-sm'
                    : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-[var(--wb-accent)]" />
                <span className="hidden sm:inline">{promoHighlight.title}</span>
                <span className="text-[var(--wb-accent)] font-extrabold">{storeSettings.promoPillText || 'Até 40% OFF'}</span>
              </button>
            )}

            <button
              onClick={onExploreClick}
              className="px-4 py-2.5 bg-[var(--wb-primary)] hover:brightness-110 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
              aria-label="Explorar catálogo"
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
