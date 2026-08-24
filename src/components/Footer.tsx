import React, { useState } from 'react';
import { Instagram, Send, Check, UserX } from 'lucide-react';
import { addSubscriber, removeSubscriber } from '../services/api';
import { StoreSettings, DEFAULT_STORE_SETTINGS } from '../types';

interface FooterProps {
  storeSettings?: StoreSettings;
}

export const Footer: React.FC<FooterProps> = ({ storeSettings = DEFAULT_STORE_SETTINGS }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [isUnsubscribeMode, setIsUnsubscribeMode] = useState(false);
  const [error, setError] = useState('');

  const storeName = storeSettings?.storeName || DEFAULT_STORE_SETTINGS.storeName;
  const storeSlogan = storeSettings?.storeSlogan || DEFAULT_STORE_SETTINGS.storeSlogan;
  const logoUrl = storeSettings?.logoUrl || DEFAULT_STORE_SETTINGS.logoUrl;
  const storeNameParts = storeName.match(/^(.*?)(\s+shop)$/i);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Digite um e-mail válido.');
      return;
    }

    try {
      await addSubscriber(cleanEmail);
    } catch {
      // fallback
    }

    setSubscribed(true);
    setEmail('');
    setTimeout(() => {
      setSubscribed(false);
    }, 5000);
  };

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Digite um e-mail válido.');
      return;
    }

    try {
      await removeSubscriber(cleanEmail);
    } catch {
      // fallback
    }

    setUnsubscribed(true);
    setEmail('');
    setTimeout(() => {
      setUnsubscribed(false);
      setIsUnsubscribeMode(false);
    }, 5000);
  };

  return (
    <footer className="mt-12 sm:mt-16 bg-[#0c0c10] text-zinc-400 border-t border-zinc-800/50 pt-8 pb-6">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 pb-6 border-b border-zinc-800/50">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src={logoUrl}
                alt={storeName}
                className="w-8 h-8 object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="text-white text-base font-bold">
                {storeNameParts ? (
                  <>
                    <span>{storeNameParts[1]}</span>
                    <span className="text-[var(--wb-interface)]">{storeNameParts[2]}</span>
                  </>
                ) : storeName}
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              {storeSlogan}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://www.tiktok.com/@woobox.shop"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                title="TikTok"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.65 6.34 6.34 0 0 0 9.35 22a6.33 6.33 0 0 0 6.32-6.33V9.17a8.16 8.16 0 0 0 3.92 1V6.69z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/wooboxshop/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Guarantee / Info */}
          <div id="sobre-a-curadoria" className="space-y-2 scroll-mt-24">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Sobre a Curadoria
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Filtramos produtos interessantes, bem avaliados e com bom custo-benefício em lojas confiáveis. Menos busca, mais achados que valem a pena.
            </p>
          </div>

          {/* Institutional Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Links
            </h4>
            <nav className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <a href="#sobre-a-curadoria" className="hover:text-white transition-colors">Sobre</a>
              <a href="#legal-summary" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#legal-summary" className="hover:text-white transition-colors">Termos</a>
              <a href="#affiliate-disclosure" className="hover:text-white transition-colors">Afiliados</a>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              {isUnsubscribeMode ? 'Desinscrever-se' : 'Novidades & Ofertas'}
            </h4>
            
            {subscribed ? (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>E-mail cadastrado com sucesso!</span>
              </div>
            ) : unsubscribed ? (
              <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 text-xs flex items-center gap-2">
                <UserX className="w-4 h-4 shrink-0 text-zinc-400" />
                <span>E-mail removido da lista.</span>
              </div>
            ) : (
              <form onSubmit={isUnsubscribeMode ? handleUnsubscribe : handleSubscribe} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Digite seu e-mail..."
                    className="flex-1 px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 outline-none focus:border-zinc-600 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors shrink-0 cursor-pointer text-xs font-medium flex items-center gap-1"
                  >
                    {isUnsubscribeMode ? <UserX className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
                
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnsubscribeMode(!isUnsubscribeMode);
                      setError('');
                    }}
                    className="text-[11px] text-zinc-500 hover:text-zinc-400 transition-colors cursor-pointer"
                  >
                    {isUnsubscribeMode ? 'Voltar para inscrição' : 'Cancelar inscrição'}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div id="affiliate-disclosure" className="rounded-xl bg-white/[0.025] px-3 py-2.5 text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
          Alguns links da Woobox são links de afiliado. Podemos receber uma comissão pela compra, sem nenhum custo adicional para você.
        </div>

        <div id="legal-summary" className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 scroll-mt-24">
          <p>© {new Date().getFullYear()} {storeName}. Todos os direitos reservados.</p>
          <p>Curadoria independente de produtos e ofertas verificadas.</p>
        </div>

      </div>
    </footer>
  );
};
