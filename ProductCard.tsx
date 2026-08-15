import React, { useState, useEffect, useRef } from 'react';

interface PriceSliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  className?: string;
}

export const PriceSlider: React.FC<PriceSliderProps> = ({
  value,
  min,
  max,
  onChange,
  className = '',
}) => {
  const [localVal, setLocalVal] = useState<number>(value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with prop when external filter resets or updates
  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value);
    setLocalVal(newVal);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(newVal);
    }, 70);
  };

  const handleCommit = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onChange(localVal);
  };

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className={`bg-zinc-900/90 p-3.5 rounded-2xl border border-zinc-800/80 space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400 font-medium">Preço Máximo:</span>
        <span className="font-black text-[var(--wb-accent)] bg-[var(--wb-accent)]/10 px-2 py-0.5 rounded-lg border border-[var(--wb-accent)]/20">
          Até {formatBRL(localVal)}
        </span>
      </div>

      <div className="relative py-1">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={localVal}
          onChange={handleInputChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--wb-primary)] focus:outline-none touch-action-none"
        />
      </div>

      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold">
        <span>Min: {formatBRL(min)}</span>
        <span>Max: {formatBRL(max)}</span>
      </div>
    </div>
  );
};
