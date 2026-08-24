import React from 'react';
import { CategoryOption } from '../types';
import { renderCategoryIcon } from '../utils/categoryIcons';
import { PriceSlider } from './PriceSlider';
import {
  Sparkles,
  ArrowUpDown,
  Filter,
  Percent,
  RotateCcw,
  SlidersHorizontal,
  X,
  Flame,
} from 'lucide-react';

interface FilterBarProps {
  categories: CategoryOption[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  maxPriceLimit: number;
  onPriceLimitChange: (val: number) => void;
  minPossiblePrice: number;
  maxPossiblePrice: number;
  onlyPromos: boolean;
  onTogglePromos: () => void;
  totalResults: number;
  categoryCounts: Record<string, number>;
  onResetFilters: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  maxPriceLimit,
  onPriceLimitChange,
  minPossiblePrice,
  maxPossiblePrice,
  onlyPromos,
  onTogglePromos,
  totalResults,
  categoryCounts,
  onResetFilters,
  isOpenMobile,
  onCloseMobile,
}) => {
  const getCategoryIcon = (iconName: string) => {
    return renderCategoryIcon(iconName, 'w-4 h-4');
  };

  const isFiltered =
    selectedCategory !== 'todos' ||
    maxPriceLimit < maxPossiblePrice ||
    sortBy !== 'populares';

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const SidebarContent = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[var(--wb-primary)]/15 text-[var(--wb-primary-light)]">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-black text-white uppercase tracking-wider">
            Filtros & Categorias
          </h2>
        </div>

        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="text-[11px] text-zinc-400 hover:text-[var(--wb-primary-light)] flex items-center gap-1 transition-colors font-bold cursor-pointer"
            title="Limpar todos os filtros"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpar</span>
          </button>
        )}
      </div>

      {/* Dynamic Price Range Slider */}
      <PriceSlider
        value={maxPriceLimit}
        min={minPossiblePrice}
        max={maxPossiblePrice}
        onChange={onPriceLimitChange}
      />

      {/* Sort Selector */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
          Ordenar Por
        </label>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-white text-xs font-bold rounded-xl px-3 py-2.5 outline-none appearance-none cursor-pointer focus:border-[var(--wb-primary)]/80 transition-colors pr-8"
          >
            <option value="populares">Mais Populares</option>
            <option value="menor-preco">Menor Preço</option>
            <option value="maior-preco">Maior Preço</option>
            <option value="maior-desconto">Maior Desconto (%)</option>
            <option value="recentes">Mais Recentes</option>
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Categories Vertical List */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
            Categorias
          </span>
          <span className="text-[10px] text-zinc-500 font-bold">
            {categories.length - 1} seções
          </span>
        </div>

        <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] ?? 0;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all font-bold cursor-pointer border ${
                  isSelected
                    ? 'bg-[var(--wb-primary)]/15 text-[var(--wb-primary-light)] border-[var(--wb-primary)]/60 shadow-sm shadow-[var(--wb-primary)]/10'
                    : 'bg-zinc-900/50 hover:bg-zinc-800/80 text-zinc-300 hover:text-white border-transparent hover:border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isSelected ? 'bg-[var(--wb-primary)]/20 text-[var(--wb-primary-light)]' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <span className="truncate">{cat.name}</span>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black shrink-0 ${
                    isSelected
                      ? 'bg-[var(--wb-primary)]/25 text-[var(--wb-primary-light)]'
                      : 'bg-zinc-950/80 text-zinc-400 border border-zinc-800/80'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count Badge */}
      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
        <span>Exibindo:</span>
        <span className="text-white font-black bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
          <strong className="text-[var(--wb-primary-light)]">{totalResults}</strong> produtos
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Container */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20 bg-[#0e0d16] rounded-3xl p-4 border border-zinc-800/80 shadow-lg">
          {SidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer Slide-Over */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/85 animate-fade-in"
          />

          {/* Drawer Panel */}
          <div className="relative w-80 max-w-[85vw] bg-[#0e0d16] border-r border-zinc-800/90 h-full p-6 overflow-y-auto z-10 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
                <span className="text-sm font-black text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[var(--wb-primary)]" /> Filtros
                </span>
                <button
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {SidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
