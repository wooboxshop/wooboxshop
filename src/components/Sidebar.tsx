import React from 'react';
import { CategoryOption, PlatformType } from '../types';
import {
  Home,
  Tag,
  Sparkles,
} from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { PriceRangeFilter, PriceRangeValue } from './PriceRangeFilter';
import { STORE_PLATFORMS } from '../utils/platforms';
import { renderCategoryIcon } from '../utils/categoryIcons';

interface SidebarProps {
  categories: CategoryOption[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  selectedPlatform?: string | null;
  onSelectPlatform?: (platform: string | null) => void;
  availablePlatforms?: PlatformType[];
  priceBounds: PriceRangeValue;
  priceRange: PriceRangeValue;
  onPriceRangeChange: (value: PriceRangeValue) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  activeTab,
  onSelectTab,
  selectedPlatform = null,
  onSelectPlatform,
  availablePlatforms = [],
  priceBounds,
  priceRange,
  onPriceRangeChange,
}) => {
  const partnerStores = STORE_PLATFORMS.filter((store) => availablePlatforms.includes(store.id));

  return (
    <aside className="w-52 shrink-0 hidden lg:block">
      <div className="sticky top-20 rounded-2xl px-2 py-2 space-y-4">
        
        {/* Top Navigation Links */}
        <div className="space-y-1">
          <button
            onClick={() => onSelectTab('inicio')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'inicio' && !selectedPlatform && selectedCategory === 'todos'
                ? 'bg-white/[0.07] text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Início</span>
          </button>

          <button
            onClick={() => onSelectTab('ofertas')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'ofertas'
                ? 'bg-white/[0.07] text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Ofertas</span>
          </button>

          <button
            onClick={() => onSelectTab('novidades')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'novidades'
                ? 'bg-white/[0.07] text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Novidades</span>
          </button>
        </div>

        {/* Categorias Section */}
        <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
          <div className="px-3 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Categorias
            </span>
          </div>

          <div className="space-y-0.5">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id && !selectedPlatform;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (onSelectPlatform) onSelectPlatform(null);
                    onSelectCategory(cat.id);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-white/[0.07] text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 font-medium'
                  }`}
                >
                  <span className={`shrink-0 ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                    {renderCategoryIcon(cat.icon, 'w-4 h-4')}
                  </span>
                  <span className="truncate text-left">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range */}
        <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
          <div className="px-3 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Preço
            </span>
          </div>
          <PriceRangeFilter
            bounds={priceBounds}
            value={priceRange}
            onChange={onPriceRangeChange}
          />
        </div>

        {/* Lojas Parceiras Section */}
        {partnerStores.length > 0 && (
          <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
            <div className="px-3 py-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Lojas
              </span>
            </div>

            <div className="space-y-0.5">
              {partnerStores.map((store) => {
                const isSelected = selectedPlatform === store.id;

                return (
                  <button
                    key={store.id}
                    onClick={() => {
                      if (onSelectPlatform) {
                        onSelectPlatform(isSelected ? null : store.id);
                      }
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-white/[0.07] text-white font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60 font-medium'
                    }`}
                  >
                    <div className="w-4 h-4 shrink-0 rounded flex items-center justify-center">
                      <PlatformIcon platform={store.id} className="w-4 h-4" />
                    </div>
                    <span className="truncate text-left">{store.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
};
