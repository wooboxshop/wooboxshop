import React, { useState } from 'react';
import { ShieldCheck, Heart, Instagram, Send, Shield, Check, UserX } from 'lucide-react';
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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Por favor, digite um e-mail válido.');
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
      setError('Por favor, digite um e-mail válido.');
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
    <footer className="mt-16 bg-[#07060b] text-zinc-400 border-t border-zinc-800/80 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-zinc-800/80">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src={logoUrl}
                alt={storeName}
                className="w-10 h-10 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />

              <div className="flex flex-col items-start leading-none font-black font-sans">
                {storeName === 'Woobox Shop' ? (
                  <>
                    <div className="text-xl font-black tracking-tight">
                      <span className="text-white">WOO</span>
                      <span className="bg-gradient-to-r from-pink-500 to-amber-500 bg-clip-text text-transparent">BOX</span>
                    </div>
                    <span className="text-xs text-zinc-300 font-black uppercase tracking-[0.22em] text-center w-full mt-0.5">
                      SHOP
                    </span>
                  </>
                ) : (
                  <span className="bg-gradient-to-r from-white via-pink-300 to-amber-300 bg-clip-text text-transparent text-xl font-black">
                    {storeName}
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              {storeSlogan}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://www.tiktok.com/@woobox.shop"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-zinc-900 hover:bg-pink-500/20 text-zinc-400 hover:text-white rounded-xl transition-all border border-zinc-800"
                title="Siga no TikTok"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.65 6.34 6.34 0 0 0 9.35 22a6.33 6.33 0 0 0 6.32-6.33V9.17a8.16 8.16 0 0 0 3.92 1V6.69z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/wooboxshop/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-zinc-900 hover:bg-pink-500/20 text-zinc-400 hover:text-pink-400 rounded-xl transition-all border border-zinc-800"
                title="Siga no Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">Navegação</h4>
            <ul className="space-y-2 text-xs text-zinc-400 font-medium">
              <li><a href="#" className="hover:text-pink-400 transition-colors">Início</a></li>
              <li><a href="#categorias" className="hover:text-pink-400 transition-colors">Categorias</a></li>
              <li><a href="#catalogo" className="hover:text-pink-400 transition-colors">Ofertas em Destaque</a></li>
              <li><a href="#catalogo" className="hover:text-pink-400 transition-colors">Mais Vendidos</a></li>
            </ul>
          </div>

          {/* Verification & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Qualidade & Segurança
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Todos os itens exibidos passam por rigoroso filtro de reputação do vendedor e procedência em grandes plataformas como Shopee, Amazon, AliExpress e Mercado Livre.
            </p>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">
              {isUnsubscribeMode ? 'Desinscrever-se' : 'Receba novidades'}
            </h4>
            
            {subscribed ? (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>E-mail cadastrado! Você receberá nossas melhores ofertas.</span>
              </div>
            ) : unsubscribed ? (
              <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-300 text-xs flex items-center gap-2 animate-in fade-in">
                <UserX className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Seu e-mail foi removido da lista de novidades.</span>
              </div>
            ) : (
              <form onSubmit={isUnsubscribeMode ? handleUnsubscribe : handleSubscribe} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder={isUnsubscribeMode ? "E-mail para remover..." : "Seu e-mail..."}
                    className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 outline-none focus:border-pink-500"
                  />
                  <button
                    type="submit"
                    className={`p-2 text-white rounded-xl hover:opacity-90 transition-opacity shrink-0 cursor-pointer ${
                      isUnsubscribeMode
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-gradient-to-r from-pink-500 to-amber-500'
                    }`}
                    title={isUnsubscribeMode ? "Desinscrever" : "Inscrever-se"}
                  >
                    {isUnsubscribeMode ? <UserX className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
                {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
                
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnsubscribeMode(!isUnsubscribeMode);
                      setError('');
                    }}
                    className="text-[11px] text-zinc-500 hover:text-pink-400 underline transition-colors cursor-pointer"
                  >
                    {isUnsubscribeMode ? 'Voltar para Inscrição' : 'Cancelar inscrição / Desinscrever e-mail'}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <p>© {new Date().getFullYear()} Woobox Shop. Todos os direitos reservados.</p>
          </div>
          <p className="flex items-center gap-1">
            Qualidade e seleção especial para você <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 ml-0.5" />
          </p>
        </div>

      </div>
    </footer>
  );
};

