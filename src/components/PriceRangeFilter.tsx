import React from 'react';

export interface PriceRangeValue {
  min: number;
  max: number;
}

interface PriceRangeFilterProps {
  bounds: PriceRangeValue;
  value: PriceRangeValue;
  onChange: (value: PriceRangeValue) => void;
  compact?: boolean;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);

export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  bounds,
  value,
  onChange,
  compact = false,
}) => {
  const hasRange = bounds.max > bounds.min;
  const isFiltered = value.min > bounds.min || value.max < bounds.max;

  const updateMin = (nextMin: number) => {
    onChange({ min: Math.min(nextMin, value.max), max: value.max });
  };

  const updateMax = (nextMax: number) => {
    onChange({ min: value.min, max: Math.max(nextMax, value.min) });
  };

  return (
    <div className={`space-y-3 ${compact ? 'px-2 pb-1' : 'px-3 pb-1'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-zinc-500">Faixa selecionada</span>
        {isFiltered && (
          <button
            type="button"
            onClick={() => onChange(bounds)}
            className="text-[10px] font-semibold text-[var(--wb-interface-light)] hover:brightness-110 cursor-pointer"
          >
            Limpar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="rounded-xl bg-white/[0.04] px-2.5 py-2 ring-1 ring-white/[0.06] focus-within:ring-[var(--wb-interface)]/30">
          <span className="block text-[9px] uppercase tracking-wider text-zinc-500">Mínimo</span>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-zinc-200">
            <span>R$</span>
            <input
              type="number"
              min={bounds.min}
              max={value.max}
              step="0.01"
              value={value.min}
              onChange={(event) => updateMin(Number(event.target.value))}
              className="min-w-0 w-full bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Valor mínimo"
            />
          </div>
          <span className="sr-only">{formatPrice(value.min)}</span>
        </label>
        <label className="rounded-xl bg-white/[0.04] px-2.5 py-2 ring-1 ring-white/[0.06] focus-within:ring-[var(--wb-interface)]/30">
          <span className="block text-[9px] uppercase tracking-wider text-zinc-500">Máximo</span>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-zinc-200">
            <span>R$</span>
            <input
              type="number"
              min={value.min}
              max={bounds.max}
              step="0.01"
              value={value.max}
              onChange={(event) => updateMax(Number(event.target.value))}
              className="min-w-0 w-full bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Valor máximo"
            />
          </div>
          <span className="sr-only">{formatPrice(value.max)}</span>
        </label>
      </div>

      {hasRange && (
        <div className="space-y-2.5">
          <label className="block space-y-1">
            <span className="text-[9px] text-zinc-500">A partir de</span>
            <input
              type="range"
              min={bounds.min}
              max={bounds.max}
              step={1}
              value={value.min}
              onChange={(event) => updateMin(Number(event.target.value))}
              className="w-full h-1 accent-[var(--wb-interface)] cursor-pointer"
              aria-label="Preço mínimo"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[9px] text-zinc-500">Até</span>
            <input
              type="range"
              min={bounds.min}
              max={bounds.max}
              step={1}
              value={value.max}
              onChange={(event) => updateMax(Number(event.target.value))}
              className="w-full h-1 accent-[var(--wb-interface)] cursor-pointer"
              aria-label="Preço máximo"
            />
          </label>
        </div>
      )}
    </div>
  );
};
