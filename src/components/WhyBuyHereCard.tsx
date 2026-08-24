import React from 'react';
import { Star, Tag, ShieldCheck, RefreshCw } from 'lucide-react';

export const WhyBuyHereCard: React.FC = () => {
  return (
    <div className="bg-[#111116] rounded-2xl p-5 border border-zinc-800/70 shadow-sm space-y-4 h-full flex flex-col justify-between">
      <div className="pb-2 border-b border-zinc-800/50">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Por que comprar aqui?
        </h3>
      </div>

      <div className="space-y-3.5 flex-1 flex flex-col justify-around py-1">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-zinc-800/80 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Curadoria Especial</h4>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Produtos selecionados e testados
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-zinc-800/80 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
            <Tag className="w-3.5 h-3.5 text-zinc-300" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Melhores Ofertas</h4>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Preços e descontos atualizados
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-zinc-800/80 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Compra Segura</h4>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Lojas oficiais e confiáveis
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-zinc-800/80 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
            <RefreshCw className="w-3.5 h-3.5 text-zinc-300" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Atualizações Diárias</h4>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Novidades constantes no catálogo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
