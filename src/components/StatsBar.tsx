import React from 'react';
import { Star, Store, Percent, RefreshCw } from 'lucide-react';

export const StatsBar: React.FC = () => {
  return (
    <div className="bg-[#0e0d16] rounded-3xl p-4 sm:p-6 border border-zinc-800/80 shadow-xl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800/80">
        
        {/* Stat 1 */}
        <div className="flex items-center gap-3.5 pt-2 lg:pt-0 sm:px-2">
          <div className="w-10 h-10 rounded-xl bg-[var(--wb-primary)]/20 text-[var(--wb-primary-light)] flex items-center justify-center shrink-0 border border-[var(--wb-primary)]/30">
            <Star className="w-5 h-5 fill-[var(--wb-primary)]" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-black text-white block leading-tight">
              +10 mil
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              Produtos selecionados
            </span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="flex items-center gap-3.5 pt-2 lg:pt-0 sm:px-2">
          <div className="w-10 h-10 rounded-xl bg-[var(--wb-primary)]/20 text-[var(--wb-primary-light)] flex items-center justify-center shrink-0 border border-[var(--wb-primary)]/30">
            <Store className="w-5 h-5 text-[var(--wb-primary-light)]" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-black text-white block leading-tight">
              +50
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              Lojas parceiras
            </span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="flex items-center gap-3.5 pt-3 lg:pt-0 sm:px-2">
          <div className="w-10 h-10 rounded-xl bg-[var(--wb-primary)]/20 text-[var(--wb-primary-light)] flex items-center justify-center shrink-0 border border-[var(--wb-primary)]/30">
            <Percent className="w-5 h-5 text-[var(--wb-primary-light)]" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-black text-white block leading-tight">
              Até 70% OFF
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              Descontos exclusivos
            </span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="flex items-center gap-3.5 pt-3 lg:pt-0 sm:px-2">
          <div className="w-10 h-10 rounded-xl bg-[var(--wb-primary)]/20 text-[var(--wb-primary-light)] flex items-center justify-center shrink-0 border border-[var(--wb-primary)]/30">
            <RefreshCw className="w-5 h-5 text-[var(--wb-primary-light)]" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-black text-white block leading-tight">
              Atualizado
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              Todos os dias
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
