import React, { useState, useEffect } from 'react';
import { Product, Highlight, MetricSummary, CategoryOption, StoreSettings, DEFAULT_STORE_SETTINGS } from '../types';
import { formatCurrency, formatDate, getPlatformBadgeColor } from '../utils/helpers';
import {
  fetchMetrics,
  resetMetrics,
  resetDatabase,
  deleteProduct,
  updateProduct,
  deleteHighlight,
  updateHighlight,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  setAdminCode,
  resetAdminCodeToDefault,
  getAdminUsername,
  setAdminUsername,
  fetchSubscribers,
  subscribeToSubscribers,
  addSubscriber,
  removeSubscriber,
  clearAllSubscribers,
  updateStoreSettings,
  getGmailAuthSettings,
  saveGmailAuthSettings,
} from '../services/api';
import { googleSignIn, logoutGoogle, getAccessToken } from '../services/auth';
import { sendNewProductNotificationToSubscribers } from '../services/gmail';
import { AVAILABLE_CATEGORY_ICONS, renderCategoryIcon } from '../utils/categoryIcons';
import {
  BarChart3,
  Package,
  Sparkles,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Flame,
  MousePointerClick,
  Layers,
  Settings,
  TrendingUp,
  Download,
  Upload,
  CheckCircle2,
  ShieldCheck,
  X,
  Clock,
  Check,
  Lock,
  Tag,
  Mail,
  Copy,
  KeyRound,
  Send,
  Loader2,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  highlights: Highlight[];
  categories?: CategoryOption[];
  onRefreshData: () => void;
  onOpenProductForm: (product?: Product) => void;
  onOpenHighlightForm: (highlight?: Highlight) => void;
  onLockAdmin?: () => void;
  storeSettings?: StoreSettings;
  onUpdateStoreSettings?: (newSettings: Partial<StoreSettings>) => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  products,
  highlights,
  categories: initialCategories = [],
  onRefreshData,
  onOpenProductForm,
  onOpenHighlightForm,
  onLockAdmin,
  storeSettings = DEFAULT_STORE_SETTINGS,
  onUpdateStoreSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'products' | 'categories' | 'highlights' | 'subscribers' | 'settings'>('metrics');
  const [metrics, setMetrics] = useState<MetricSummary | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    confirmVariant?: 'danger' | 'warning';
    onConfirm: () => Promise<void> | void;
  } | null>(null);
  const [isExecutingConfirm, setIsExecutingConfirm] = useState(false);

  // Store Settings state
  const [storeForm, setStoreForm] = useState<StoreSettings>(storeSettings);
  const [savingStoreSettings, setSavingStoreSettings] = useState(false);

  useEffect(() => {
    if (storeSettings) {
      setStoreForm(storeSettings);
    }
  }, [storeSettings]);

  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStoreSettings(true);
    try {
      if (onUpdateStoreSettings) {
        await onUpdateStoreSettings(storeForm);
      } else {
        await updateStoreSettings(storeForm);
      }
      showNotification('Configurações da loja salvas e sincronizadas com o banco de dados!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar configurações.');
    } finally {
      setSavingStoreSettings(false);
    }
  };

  // Subscribers (Newsletter) state
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [newSubscriberEmail, setNewSubscriberEmail] = useState('');
  const [subscribersSearch, setSubscribersSearch] = useState('');

  // Gmail OAuth State (Synced with Firestore & localStorage)
  const [gmailUser, setGmailUser] = useState<{ email: string; name: string } | null>(null);
  const [gmailAccessToken, setGmailAccessToken] = useState<string | null>(null);
  const [isLoggingInGmail, setIsLoggingInGmail] = useState(false);
  const [selectedProductForEmail, setSelectedProductForEmail] = useState<string>('');
  const [isSendingEmailBlast, setIsSendingEmailBlast] = useState(false);
  const [emailBlastStatus, setEmailBlastStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    const initGmailAuth = async () => {
      try {
        const settings = await getGmailAuthSettings();
        if (settings && settings.connected) {
          setGmailUser({ email: settings.email, name: settings.name });
          const token = settings.accessToken || getAccessToken();
          if (token) setGmailAccessToken(token);
        } else {
          // Fallback check on localStorage
          const isConn = localStorage.getItem('woobox_gmail_connected') === 'true';
          if (isConn) {
            const userStr = localStorage.getItem('woobox_gmail_user');
            const userObj = userStr ? JSON.parse(userStr) : { email: 'wooboxshop@gmail.com', name: 'Woobox Shop' };
            setGmailUser(userObj);
            const token = getAccessToken();
            if (token) setGmailAccessToken(token);
          }
        }
      } catch (err) {
        console.warn('Error loading Gmail auth state:', err);
      }
    };
    initGmailAuth();
  }, []);

  useEffect(() => {
    if (products.length > 0 && !selectedProductForEmail) {
      setSelectedProductForEmail(products[0].id);
    }
  }, [products]);

  const loadSubscribers = async () => {
    try {
      const list = await fetchSubscribers();
      setSubscribers(list);
    } catch {
      setSubscribers([]);
    }
  };

  useEffect(() => {
    const unsub = subscribeToSubscribers((list) => {
      setSubscribers(list);
    });
    return () => unsub();
  }, []);

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSubscriberEmail.trim();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      alert('Digite um e-mail válido.');
      return;
    }
    if (subscribers.includes(clean)) {
      alert('Este e-mail já está cadastrado!');
      return;
    }
    const updated = await addSubscriber(clean);
    setSubscribers(updated);
    setNewSubscriberEmail('');
    showNotification('E-mail cadastrado com sucesso!');
  };

  const handleDeleteSubscriber = (emailToDelete: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remover E-mail',
      message: `Tem certeza que deseja remover o e-mail "${emailToDelete}" da lista?`,
      confirmText: 'Remover E-mail',
      confirmVariant: 'danger',
      onConfirm: async () => {
        const updated = await removeSubscriber(emailToDelete);
        setSubscribers(updated);
        showNotification('E-mail removido da lista.');
      },
    });
  };

  const handleConnectGmail = async () => {
    setIsLoggingInGmail(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGmailAccessToken(res.accessToken);
        setGmailUser({
          email: res.user.email || 'wooboxshop@gmail.com',
          name: res.user.displayName || 'Woobox Shop',
        });
        showNotification(`Conta do Gmail conectada e salva no banco de dados (${res.user.email})!`);
      }
    } catch (err: any) {
      console.error('Gmail connect error:', err);
      alert('Erro ao conectar ao Gmail: ' + (err?.message || 'Tente novamente.'));
    } finally {
      setIsLoggingInGmail(false);
    }
  };

  const handleDisconnectGmail = async () => {
    await logoutGoogle();
    setGmailAccessToken(null);
    setGmailUser(null);
    showNotification('Conta do Gmail desconectada da loja.');
  };

  const handleSendProductEmailBlast = async (productToNotify?: Product) => {
    setEmailBlastStatus(null);
    const prod = productToNotify || products.find((p) => p.id === selectedProductForEmail) || products[0];
    if (!prod) {
      setEmailBlastStatus({ type: 'error', message: 'Nenhum produto selecionado ou disponível no catálogo.' });
      return;
    }

    let token = gmailAccessToken || getAccessToken();
    let currentGmailUser = gmailUser;

    if (!token || !currentGmailUser) {
      try {
        setIsLoggingInGmail(true);
        const res = await googleSignIn();
        if (res) {
          token = res.accessToken;
          setGmailAccessToken(token);
          currentGmailUser = {
            email: res.user.email || 'wooboxshop@gmail.com',
            name: res.user.displayName || 'Woobox Shop',
          };
          setGmailUser(currentGmailUser);
        } else {
          setEmailBlastStatus({ type: 'error', message: 'Por favor, conecte sua conta do Gmail antes de enviar e-mails.' });
          return;
        }
      } catch (err: any) {
        setEmailBlastStatus({ type: 'error', message: 'Erro ao conectar com Google/Gmail: ' + (err?.message || 'Tente novamente.') });
        return;
      } finally {
        setIsLoggingInGmail(false);
      }
    }

    if (subscribers.length === 0) {
      setEmailBlastStatus({ type: 'error', message: 'Nenhum e-mail cadastrado na lista da newsletter.' });
      return;
    }

    setIsSendingEmailBlast(true);
    setEmailBlastStatus({ type: 'info', message: `Enviando e-mail do produto "${prod.title}" para ${subscribers.length} inscrito(s)...` });

    try {
      let res = await sendNewProductNotificationToSubscribers(
        token,
        currentGmailUser.email,
        subscribers,
        prod
      );

      // If token expired (e.g. 401 Unauthorized), prompt seamless re-auth once and retry automatically
      if (res.sent === 0 && res.errors.some((e) => e.includes('401') || e.includes('403') || e.includes('Invalid Credentials') || e.includes('auth'))) {
        try {
          setEmailBlastStatus({ type: 'info', message: 'Sessão do Google expirada. Renovando credenciais para disparo...' });
          const refreshRes = await googleSignIn();
          if (refreshRes) {
            token = refreshRes.accessToken;
            setGmailAccessToken(token);
            res = await sendNewProductNotificationToSubscribers(
              token,
              currentGmailUser.email,
              subscribers,
              prod
            );
          }
        } catch {
          // fallback error handler
        }
      }

      if (res.sent > 0) {
        const msg = `🎉 E-mail do produto "${prod.title}" enviado com sucesso para ${res.sent} inscrito(s) via Gmail!`;
        setEmailBlastStatus({ type: 'success', message: msg });
        showNotification(msg);
      } else {
        const errDetail = res.errors.length > 0 ? res.errors.join(' | ') : 'Nenhum e-mail foi entregue.';
        setEmailBlastStatus({ type: 'error', message: `Ocorreu uma falha no envio: ${errDetail}` });
      }
    } catch (err: any) {
      console.error('Error sending email blast:', err);
      setEmailBlastStatus({ type: 'error', message: 'Erro ao disparar e-mails: ' + (err?.message || 'Erro desconhecido.') });
    } finally {
      setIsSendingEmailBlast(false);
    }
  };

  const handleClearAllSubscribers = async () => {
    if (window.confirm('Tem certeza de que deseja apagar todos os e-mails cadastrados? Esta ação não pode ser desfeita.')) {
      await clearAllSubscribers();
      setSubscribers([]);
      showNotification('Todos os e-mails foram removidos.');
    }
  };

  const handleCopySubscribers = () => {
    if (subscribers.length === 0) return;
    const text = subscribers.join(', ');
    navigator.clipboard.writeText(text);
    showNotification('Lista de e-mails copiada para a área de transferência!');
  };

  const handleExportSubscribersCSV = () => {
    if (subscribers.length === 0) return;
    const csvContent =
      'data:text/csv;charset=utf-8,Email,Data\n' +
      subscribers.map((e) => `"${e}","${new Date().toLocaleDateString('pt-BR')}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `woobox_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Arquivo CSV baixado com sucesso!');
  };

  // Admin passcode & credentials state
  const [adminUserSetting, setAdminUserSetting] = useState('admin');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcodeMsg, setPasscodeMsg] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    getAdminUsername().then((u) => setAdminUserSetting(u));
  }, [isOpen]);

  const handleChangePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeMsg(null);
    const cleanUser = adminUserSetting.trim();
    const cleanPass = newPasscode.trim();

    if (!cleanUser || cleanUser.length < 3) {
      setPasscodeMsg({ text: 'O usuário deve conter pelo menos 3 caracteres.', isError: true });
      return;
    }

    if (cleanPass) {
      if (cleanPass.length < 4) {
        setPasscodeMsg({ text: 'A senha deve conter pelo menos 4 caracteres.', isError: true });
        return;
      }
      if (cleanPass !== confirmPasscode.trim()) {
        setPasscodeMsg({ text: 'As senhas digitadas não coincidem.', isError: true });
        return;
      }
    }

    try {
      await setAdminUsername(cleanUser);
      if (cleanPass) {
        await setAdminCode(cleanPass);
      }
      setPasscodeMsg({
        text: 'Credenciais administrativas (usuário e senha) salvas e sincronizadas no banco de dados com sucesso!',
        isError: false,
      });
      setNewPasscode('');
      setConfirmPasscode('');
      showNotification('Credenciais de login atualizadas!');
    } catch (err: any) {
      setPasscodeMsg({ text: err?.message || 'Erro ao alterar credenciais.', isError: true });
    }
  };

  const handleResetPasscodeToDefault = async () => {
    if (window.confirm('Deseja restaurar o usuário e senha para o padrão inicial (usuário: "admin" / senha: "wooboxadm99")?')) {
      await resetAdminCodeToDefault();
      setAdminUserSetting('admin');
      setPasscodeMsg({ text: 'Credenciais restauradas para o padrão inicial (admin / wooboxadm99).', isError: false });
      showNotification('Credenciais de acesso restauradas.');
    }
  };

  // Category management state
  const [categoriesList, setCategoriesList] = useState<CategoryOption[]>(initialCategories);
  const [editingCategory, setEditingCategory] = useState<CategoryOption | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('Tag');
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [selectedIconGroup, setSelectedIconGroup] = useState('Todas');
  const [isCategorySaving, setIsCategorySaving] = useState(false);

  const loadCategoriesData = async () => {
    try {
      const cats = await fetchCategories();
      if (cats && cats.length > 0) {
        setCategoriesList(cats);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadMetricsData = async () => {
    setLoadingMetrics(true);
    try {
      const data = await fetchMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMetricsData();
      loadCategoriesData();
      loadSubscribers();
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategoriesList(initialCategories);
    }
  }, [initialCategories]);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setIsCategorySaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: categoryName.trim(),
          icon: categoryIcon,
        });
        showNotification('Categoria atualizada com sucesso!');
      } else {
        await createCategory({
          name: categoryName.trim(),
          icon: categoryIcon,
        });
        showNotification('Nova categoria criada com sucesso!');
      }
      setEditingCategory(null);
      setCategoryName('');
      setCategoryIcon('Tag');
      await loadCategoriesData();
      onRefreshData();
    } catch (err) {
      console.error('Error saving category:', err);
      alert('Erro ao salvar categoria.');
    } finally {
      setIsCategorySaving(false);
    }
  };

  const handleStartEditCategory = (cat: CategoryOption) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryIcon(cat.icon || 'Tag');
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryIcon('Tag');
  };

  const handleDeleteCategoryConfirm = (cat: CategoryOption) => {
    if (cat.id === 'todos') {
      showNotification("A categoria padrão 'Todos' não pode ser excluída.");
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Categoria',
      message: `Tem certeza que deseja excluir a categoria "${cat.name}"?`,
      confirmText: 'Excluir Categoria',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          await deleteCategory(cat.id);
          showNotification(`Categoria "${cat.name}" excluída com sucesso.`);
          await loadCategoriesData();
          onRefreshData();
        } catch (err) {
          console.error('Error deleting category:', err);
        }
      },
    });
  };

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleResetClicks = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Zerar Contador de Cliques',
      message: 'Tem certeza que deseja zerar o contador de todos os cliques nos links de afiliados?',
      confirmText: 'Sim, Zerar Cliques',
      confirmVariant: 'warning',
      onConfirm: async () => {
        await resetMetrics();
        showNotification('Métricas de cliques zeradas com sucesso!');
        loadMetricsData();
        onRefreshData();
      },
    });
  };

  const handleRestoreDatabase = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Restaurar Catálogo Inicial',
      message: 'Tem certeza que deseja restaurar o banco de dados com os produtos e destaques padrão?',
      confirmText: 'Sim, Restaurar Banco',
      confirmVariant: 'danger',
      onConfirm: async () => {
        await resetDatabase();
        showNotification('Banco de dados restaurado com o catálogo inicial!');
        loadMetricsData();
        onRefreshData();
      },
    });
  };

  const handleToggleProductActive = async (p: Product) => {
    await updateProduct(p.id, { isActive: !p.isActive });
    showNotification(`Produto "${p.title}" ${!p.isActive ? 'ativado' : 'desativado'}.`);
    onRefreshData();
    loadMetricsData();
  };

  const handleDeleteProductConfirm = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Produto',
      message: `Tem certeza que deseja excluir permanentemente o produto "${title}"?`,
      confirmText: 'Excluir Produto',
      confirmVariant: 'danger',
      onConfirm: async () => {
        await deleteProduct(id);
        showNotification('Produto excluído com sucesso!');
        onRefreshData();
        loadMetricsData();
      },
    });
  };

  const handleToggleHighlightActive = async (h: Highlight) => {
    await updateHighlight(h.id, { isActive: !h.isActive });
    showNotification(`Destaque "${h.title}" ${!h.isActive ? 'ativado' : 'desativado'}.`);
    onRefreshData();
  };

  const handleDeleteHighlightConfirm = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Evento / Destaque',
      message: `Tem certeza que deseja excluir o evento especial "${title}"?`,
      confirmText: 'Excluir Destaque',
      confirmVariant: 'danger',
      onConfirm: async () => {
        await deleteHighlight(id);
        showNotification('Evento especial excluído com sucesso!');
        onRefreshData();
      },
    });
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative bg-zinc-900 text-white w-full max-w-[1400px] rounded-3xl shadow-2xl overflow-hidden h-[94vh] flex flex-col border border-pink-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Admin Header Bar */}
        <div className="p-4 sm:p-5 bg-zinc-950 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-pink-600 to-rose-500 rounded-2xl shadow-lg ring-2 ring-pink-500/30 shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Painel Administrativo Woobox</h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Painel Ativo
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium hidden sm:block">
                Métricas de cliques em tempo real, gestão de links de afiliados e eventos especiais.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <button
              onClick={loadMetricsData}
              className="p-2 sm:p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl border border-zinc-700 transition-colors cursor-pointer"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${loadingMetrics ? 'animate-spin' : ''}`} />
            </button>
            {onLockAdmin && (
              <button
                onClick={() => {
                  onLockAdmin();
                  onClose();
                }}
                className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Sair do modo administrativo e bloquear acesso"
              >
                <Lock className="w-3.5 h-3.5" /> Bloquear
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" /> Fechar
            </button>
          </div>
        </div>

        {/* Action Success Toast */}
        {actionSuccess && (
          <div className="bg-emerald-500 text-zinc-950 px-4 py-2 text-xs font-black flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 bg-zinc-900/95 border-b border-zinc-800/90 overflow-x-auto custom-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold sm:font-black flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'metrics'
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md ring-1 ring-pink-400/40'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Métricas & Desempenho</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold sm:font-black flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md ring-1 ring-pink-400/40'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Gerenciar Produtos ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold sm:font-black flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md ring-1 ring-pink-400/40'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Categorias ({categoriesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('highlights')}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold sm:font-black flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'highlights'
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md ring-1 ring-pink-400/40'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Destaques & Eventos ({highlights.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subscribers')}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold sm:font-black flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'subscribers'
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md ring-1 ring-pink-400/40'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Newsletter / E-mails ({subscribers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold sm:font-black flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md ring-1 ring-pink-400/40'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações & Dados</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          
          {/* TAB 1: METRICS & CLICK PERFORMANCE */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-3xl bg-zinc-800/60 border border-zinc-700/80 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
                    <span>Total de Cliques</span>
                    <MousePointerClick className="w-4 h-4 text-pink-400" />
                  </div>
                  <p className="text-3xl font-black text-white">{metrics?.totalClicks || 0}</p>
                  <p className="text-[11px] text-pink-400 flex items-center gap-1 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" /> Redirecionamentos para lojas
                  </p>
                </div>

                <div className="p-4 rounded-3xl bg-zinc-800/60 border border-zinc-700/80 space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
                    <span>Produtos Ativos</span>
                    <Package className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-3xl font-black text-white">
                    {metrics?.activeProducts || 0} <span className="text-xs font-medium text-zinc-500">/ {metrics?.totalProducts || 0}</span>
                  </p>
                  <p className="text-[11px] text-emerald-400 font-semibold">Links visíveis na curadoria</p>
                </div>

                <div className="p-4 rounded-3xl bg-zinc-800/60 border border-zinc-700/80 space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
                    <span>Média Cliques / Link</span>
                    <Flame className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-3xl font-black text-white">
                    {metrics?.totalProducts
                      ? Math.round((metrics.totalClicks || 0) / metrics.totalProducts)
                      : 0}
                  </p>
                  <p className="text-[11px] text-amber-400 font-semibold">Engajamento médio por item</p>
                </div>

                <div className="p-4 rounded-3xl bg-zinc-800/60 border border-zinc-700/80 space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
                    <span>Especiais em Destaque</span>
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-3xl font-black text-white">{metrics?.totalHighlights || 0}</p>
                  <p className="text-[11px] text-purple-400 font-semibold">Eventos sazonais ativos</p>
                </div>
              </div>

              {/* Grid with Top Products & Platform Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Top 5 Products by Clicks */}
                <div className="lg:col-span-2 p-5 rounded-3xl bg-zinc-800/40 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-pink-500 fill-pink-500" />
                      Links Mais Clicados (Top Desempenho)
                    </h3>
                    <span className="text-xs text-zinc-400 font-medium">Rankings de Afiliados</span>
                  </div>

                  <div className="space-y-3">
                    {metrics?.topProducts?.map((p, idx) => {
                      const maxClicks = metrics.topProducts[0]?.clicksCount || 1;
                      const percentage = Math.min(100, Math.round((p.clicksCount / maxClicks) * 100));

                      return (
                        <div key={p.id} className="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-2">
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="font-black text-pink-400 text-xs w-5">#{idx + 1}</span>
                              <img src={p.imageUrl} alt={p.title} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                              <span className="font-bold text-white truncate">{p.title}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-black text-pink-300">{p.clicksCount} cliques</span>
                              <span className="text-zinc-400 font-bold">{formatCurrency(p.price)}</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Platform Distribution */}
                <div className="p-5 rounded-3xl bg-zinc-800/40 border border-zinc-800 space-y-4">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    Cliques por Plataforma
                  </h3>

                  <div className="space-y-2.5">
                    {metrics?.platformDistribution?.map((plat) => {
                      const badge = getPlatformBadgeColor(plat.platform);
                      return (
                        <div key={plat.platform} className="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs font-black text-white">{plat.count} cliques</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Click Activity Feed */}
              <div className="p-5 rounded-3xl bg-zinc-800/40 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Histórico de Acessos Recentes aos Links (Ao Vivo)
                  </h3>
                  <span className="text-xs text-zinc-400 font-mono">Mostrando os últimos cliques</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-zinc-800/80">
                  <table className="w-full text-left text-xs text-zinc-300 min-w-[500px]">
                    <thead className="bg-zinc-900 text-zinc-400 uppercase font-bold text-[10px] border-b border-zinc-800">
                      <tr>
                        <th className="p-3 whitespace-nowrap">Data e Hora</th>
                        <th className="p-3 whitespace-nowrap">Produto Acessado</th>
                        <th className="p-3 whitespace-nowrap">Plataforma</th>
                        <th className="p-3 whitespace-nowrap">Origem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-medium">
                      {metrics?.recentClicks?.map((log) => {
                        const badge = getPlatformBadgeColor(log.platform);
                        return (
                          <tr key={log.id} className="hover:bg-zinc-800/40">
                            <td className="p-3 text-zinc-400 font-mono whitespace-nowrap">{formatDate(log.timestamp)}</td>
                            <td className="p-3 font-bold text-white max-w-xs truncate">{log.productTitle}</td>
                            <td className="p-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                                {badge.label}
                              </span>
                            </td>
                            <td className="p-3 text-zinc-400 whitespace-nowrap">{log.referrer || 'direto'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Filtrar produtos no painel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-72 px-3.5 py-2 bg-zinc-800 border border-zinc-700 rounded-2xl text-xs text-white outline-none focus:border-pink-500"
                />

                <button
                  onClick={() => onOpenProductForm()}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Cadastrar Novo Produto
                </button>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-900/60">
                <table className="w-full text-left text-xs text-zinc-300 min-w-[640px]">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase font-extrabold text-[10px] border-b border-zinc-800">
                    <tr>
                      <th className="p-3.5 whitespace-nowrap">Produto</th>
                      <th className="p-3.5 whitespace-nowrap">Categoria</th>
                      <th className="p-3.5 whitespace-nowrap">Preço</th>
                      <th className="p-3.5 whitespace-nowrap">Cliques</th>
                      <th className="p-3.5 whitespace-nowrap">Status</th>
                      <th className="p-3.5 text-right whitespace-nowrap">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 font-medium">
                    {filteredProducts.map((p) => {
                      const badge = getPlatformBadgeColor(p.platform);

                      return (
                        <tr key={p.id} className="hover:bg-zinc-800/40">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <img src={p.imageUrl} alt={p.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                              <div className="min-w-0">
                                <p className="font-bold text-white truncate max-w-xs">{p.title}</p>
                                <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold ${badge.bg} ${badge.text}`}>
                                  {badge.label}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 text-zinc-400 whitespace-nowrap">{p.category}</td>
                          <td className="p-3.5 font-black text-white whitespace-nowrap">{formatCurrency(p.price)}</td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="font-bold text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-xl border border-pink-500/20">
                              🔥 {p.clicksCount || 0}
                            </span>
                          </td>

                          <td className="p-3.5 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleProductActive(p)}
                              className={`px-2.5 py-1 rounded-xl font-bold text-[10px] flex items-center gap-1.5 cursor-pointer ${
                                p.isActive
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {p.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              <span>{p.isActive ? 'Ativo' : 'Inativo'}</span>
                            </button>
                          </td>

                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleSendProductEmailBlast(p)}
                                className="p-2 bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 rounded-xl border border-pink-500/30 cursor-pointer"
                                title="Enviar Notificação por E-mail para Inscritos"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onOpenProductForm(p)}
                                className="p-2 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-xl border border-blue-500/30 cursor-pointer"
                                title="Editar"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProductConfirm(p.id, p.title)}
                                className="p-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-xl border border-rose-500/30 cursor-pointer"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: HIGHLIGHTS & CAMPAIGNS */}
          {activeTab === 'highlights' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">Eventos e Banners Especiais</h3>
                  <p className="text-xs text-zinc-400">Configure eventos como Dia dos Pais, Dia dos Namorados, etc.</p>
                </div>

                <button
                  onClick={() => onOpenHighlightForm()}
                  className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-black text-xs rounded-2xl shadow-md flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Criar Novo Evento / Destaque
                </button>
              </div>

              {highlights.length === 0 ? (
                <div className="p-8 text-center bg-zinc-900/60 rounded-3xl border border-zinc-800/80 space-y-2">
                  <p className="text-zinc-300 font-extrabold text-sm">Nenhum evento especial cadastrado.</p>
                  <p className="text-xs text-zinc-500">Clique no botão "Criar Novo Evento / Destaque" para adicionar novos banners e campanhas.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {highlights.map((h) => (
                    <div key={h.id} className="p-4 rounded-3xl bg-zinc-800/60 border border-zinc-700 space-y-3 relative">
                      <div className="relative h-32 rounded-2xl overflow-hidden bg-zinc-900">
                        <img src={h.bannerUrl} alt={h.title} className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent p-3 flex flex-col justify-between">
                          <span className="text-[10px] font-black uppercase bg-pink-600 text-white px-2 py-0.5 rounded-full self-start">
                            {h.badge}
                          </span>
                          <div>
                            <h4 className="text-base font-black text-white">{h.title}</h4>
                            <p className="text-xs text-zinc-300 line-clamp-1">{h.subtitle}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className={`px-2.5 py-1 rounded-xl font-bold text-[10px] ${h.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {h.isActive ? 'Ativo na Home' : 'Oculto'}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleHighlightActive(h)}
                            className="px-2.5 py-1 bg-zinc-700 text-zinc-200 rounded-xl text-[11px] font-bold cursor-pointer hover:bg-zinc-600"
                          >
                            {h.isActive ? 'Desativar' : 'Ativar'}
                          </button>
                          <button
                            onClick={() => onOpenHighlightForm(h)}
                            className="p-2 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-xl cursor-pointer"
                            title="Editar Destaque"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteHighlightConfirm(h.id, h.title)}
                            className="p-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-xl cursor-pointer"
                            title="Excluir Destaque"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-6 max-w-4xl">
              {/* Category Add/Edit Form */}
              <form onSubmit={handleSaveCategory} className="p-5 sm:p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-pink-400" />
                    {editingCategory ? `Editar Categoria: ${editingCategory.name}` : 'Adicionar Nova Categoria'}
                  </h3>
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={handleCancelEditCategory}
                      className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300 block">Nome da Categoria *</label>
                    <input
                      type="text"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="Ex: Livros & Papelaria, Eletrônicos, Gamer..."
                      className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-bold text-xs outline-none focus:border-pink-500"
                      required
                    />
                  </div>

                  {/* VISUAL ICON PICKER SECTION */}
                  <div className="space-y-3 p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="text-xs font-black text-pink-400 uppercase tracking-wider block">
                          Selecione o Ícone da Categoria
                        </label>
                        <p className="text-[11px] text-zinc-400">
                          Escolha um dos ícones ilustrativos disponíveis para destacar no menu de filtros.
                        </p>
                      </div>

                      {/* Selected Icon Preview Badge */}
                      <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-700/80 shrink-0">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Selecionado:</span>
                        <div className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                          {renderCategoryIcon(categoryIcon, 'w-4 h-4')}
                        </div>
                        <span className="text-xs font-extrabold text-white font-mono">{categoryIcon}</span>
                      </div>
                    </div>

                    {/* Group Filter Tabs & Search input */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                        {['Todas', 'Geral', 'Tecnologia', 'Moda', 'Casa & Cozinha', 'Saúde & Estilo', 'Outros'].map((grp) => (
                          <button
                            key={grp}
                            type="button"
                            onClick={() => setSelectedIconGroup(grp)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                              selectedIconGroup === grp
                                ? 'bg-pink-600 text-white shadow-sm'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                          >
                            {grp}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        value={iconSearchQuery}
                        onChange={(e) => setIconSearchQuery(e.target.value)}
                        placeholder="Buscar ícone por nome..."
                        className="w-full sm:w-48 px-2.5 py-1 text-[11px] bg-zinc-900 border border-zinc-700/70 rounded-lg text-white outline-none focus:border-pink-500"
                      />
                    </div>

                    {/* Icon Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-52 overflow-y-auto pr-1 pt-1">
                      {AVAILABLE_CATEGORY_ICONS.filter((ico) => {
                        const matchesGrp = selectedIconGroup === 'Todas' || ico.category === selectedIconGroup;
                        const matchesSearch =
                          !iconSearchQuery ||
                          ico.name.toLowerCase().includes(iconSearchQuery.toLowerCase()) ||
                          ico.label.toLowerCase().includes(iconSearchQuery.toLowerCase());
                        return matchesGrp && matchesSearch;
                      }).map((ico) => {
                        const isSelected = categoryIcon.toLowerCase() === ico.name.toLowerCase();
                        const IconComp = ico.icon;

                        return (
                          <button
                            key={ico.name}
                            type="button"
                            onClick={() => setCategoryIcon(ico.name)}
                            title={`${ico.label} (${ico.name})`}
                            className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-tr from-pink-600 to-rose-500 border-pink-400 text-white ring-2 ring-pink-500/40 shadow-md scale-105'
                                : 'bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            <IconComp className="w-5 h-5" />
                            <span className="text-[9px] font-bold truncate max-w-full text-center leading-tight">
                              {ico.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={handleCancelEditCategory}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isCategorySaving}
                    className="px-6 py-2.5 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-700 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}</span>
                  </button>
                </div>
              </form>

              {/* Categories List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                  Categorias Cadastradas ({categoriesList.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoriesList.map((cat) => {
                    const count = products.filter(
                      (p) => p.category.toLowerCase() === cat.name.toLowerCase()
                    ).length;

                    return (
                      <div
                        key={cat.id}
                        className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center justify-between hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                            {renderCategoryIcon(cat.icon, 'w-5 h-5')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-extrabold text-sm text-white">{cat.name}</h5>
                              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800">
                                {cat.icon || 'Tag'}
                              </span>
                            </div>
                            <span className="text-[11px] text-zinc-400 font-medium">
                              {count} {count === 1 ? 'produto' : 'produtos'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEditCategory(cat)}
                            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-xl transition-colors cursor-pointer"
                            title="Editar Categoria"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {cat.id !== 'todos' && (
                            <button
                              onClick={() => handleDeleteCategoryConfirm(cat)}
                              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl transition-colors cursor-pointer"
                              title="Excluir Categoria"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: SUBSCRIBERS / NEWSLETTER */}
          {activeTab === 'subscribers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-pink-950/40 via-zinc-900 to-amber-950/30 rounded-3xl border border-pink-500/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-pink-400" />
                    <h3 className="font-black text-lg text-white">E-mails Cadastrados na Newsletter</h3>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {subscribers.length} {subscribers.length === 1 ? 'e-mail cadastrado' : 'e-mails cadastrados'} no rodapé para receber ofertas e novidades.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopySubscribers}
                    disabled={subscribers.length === 0}
                    className="px-3 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    title="Copiar todos os e-mails separados por vírgula"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copiar Todos
                  </button>
                  <button
                    onClick={handleExportSubscribersCSV}
                    disabled={subscribers.length === 0}
                    className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    title="Baixar lista em formato CSV"
                  >
                    <Download className="w-3.5 h-3.5" /> Baixar CSV
                  </button>
                  {subscribers.length > 0 && (
                    <button
                      onClick={handleClearAllSubscribers}
                      className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Apagar todos os e-mails"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Limpar Lista
                    </button>
                  )}
                </div>
              </div>

              {/* Gmail Automation Card */}
              <div className="p-5 bg-gradient-to-r from-red-950/40 via-zinc-900 to-pink-950/30 border border-red-500/30 rounded-3xl space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                        <span>Automação de Envio com Gmail da Loja</span>
                        {gmailUser && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                            Conectado
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Dispare e-mails automáticos com foto, título e preço dos novos produtos cadastrados para todos os inscritos.
                      </p>
                    </div>
                  </div>

                  {gmailUser ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-300 font-mono font-semibold bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
                        {gmailUser.email}
                      </span>
                      <button
                        onClick={handleDisconnectGmail}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Desconectar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleConnectGmail}
                      disabled={isLoggingInGmail}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {isLoggingInGmail ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Conectando Google...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          <span>Conectar Gmail da Loja</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Send Email Blast Section */}
                <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800 space-y-3">
                  <span className="text-xs font-extrabold text-pink-300 block">
                    Disparo Manual de Notificação de Produto
                  </span>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <select
                      value={selectedProductForEmail}
                      onChange={(e) => setSelectedProductForEmail(e.target.value)}
                      className="w-full sm:flex-1 p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-semibold text-xs outline-none focus:border-pink-500"
                    >
                      {products.length === 0 ? (
                        <option value="">Nenhum produto disponível</option>
                      ) : (
                        products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} - R$ {p.price.toFixed(2)}
                          </option>
                        ))
                      )}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleSendProductEmailBlast()}
                      disabled={isSendingEmailBlast}
                      className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-pink-600 to-amber-500 hover:from-pink-700 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      {isSendingEmailBlast ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Enviar para {subscribers.length} {subscribers.length === 1 ? 'Inscrito' : 'Inscritos'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {emailBlastStatus && (
                    <div
                      className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150 ${
                        emailBlastStatus.type === 'success'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : emailBlastStatus.type === 'error'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {emailBlastStatus.type === 'info' && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                      {emailBlastStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {emailBlastStatus.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                      <span>{emailBlastStatus.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Add manual email & search bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Add email manually */}
                <form onSubmit={handleAddSubscriber} className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-2">
                  <label className="text-xs font-black text-zinc-300 uppercase tracking-wider block">
                    Cadastrar Novo E-mail Manualmente
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={newSubscriberEmail}
                      onChange={(e) => setNewSubscriberEmail(e.target.value)}
                      placeholder="exemplo@email.com"
                      className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 outline-none focus:border-pink-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-pink-600 to-amber-500 hover:from-pink-700 hover:to-amber-600 text-white font-bold text-xs rounded-xl shrink-0 flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </button>
                  </div>
                </form>

                {/* Filter / Search subscribers */}
                <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-2">
                  <label className="text-xs font-black text-zinc-300 uppercase tracking-wider block">
                    Buscar na Lista de E-mails
                  </label>
                  <input
                    type="text"
                    value={subscribersSearch}
                    onChange={(e) => setSubscribersSearch(e.target.value)}
                    placeholder="Filtrar por nome ou domínio..."
                    className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Subscribers List */}
              {subscribers.length === 0 ? (
                <div className="p-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-3">
                  <div className="w-12 h-12 mx-auto bg-pink-500/10 text-pink-400 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Nenhum e-mail cadastrado ainda</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Quando os leitores preencherem o campo "Receba novidades" no rodapé, os e-mails aparecerão listados aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                    Lista de Inscritos ({subscribers.filter((s) => s.toLowerCase().includes(subscribersSearch.toLowerCase())).length})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subscribers
                      .filter((s) => s.toLowerCase().includes(subscribersSearch.toLowerCase()))
                      .map((subEmail, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-zinc-900/90 border border-zinc-800/90 rounded-2xl flex items-center justify-between gap-2 hover:border-zinc-700 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                              <Mail className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-white truncate">{subEmail}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(subEmail);
                                showNotification(`E-mail ${subEmail} copiado!`);
                              }}
                              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                              title="Copiar e-mail"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubscriber(subEmail)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors cursor-pointer"
                              title="Remover e-mail"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SETTINGS & DATA MANAGEMENT */}
          {activeTab === 'settings' && (
            <div className="space-y-6 w-full">
              {/* Store Identity & Banner Customization Card */}
              <div className="p-6 rounded-3xl bg-zinc-800/40 border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-black text-base text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-500" />
                    Identidade da Loja & Textos do Banner (Sincronizado com Banco de Dados)
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-full w-fit">
                    Firestore Database
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Configure o nome oficial da loja, slogan do rodapé, imagem do logo e frases do banner principal. Todas as alterações são salvas e sincronizadas em tempo real.
                </p>

                <form onSubmit={handleSaveStoreSettings} className="space-y-4 pt-2 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-300 block">Nome da Loja</label>
                      <input
                        type="text"
                        value={storeForm.storeName || ''}
                        onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                        placeholder="Ex: Woobox Shop"
                        className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-extrabold outline-none focus:border-pink-500"
                        required
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="font-bold text-zinc-300 block">Slogan / Descrição do Rodapé</label>
                      <input
                        type="text"
                        value={storeForm.storeSlogan || ''}
                        onChange={(e) => setStoreForm({ ...storeForm, storeSlogan: e.target.value })}
                        placeholder="Ex: Sua plataforma de curadoria exclusiva de achadinhos..."
                        className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-300 block">URL da Imagem do Logo</label>
                    <input
                      type="url"
                      value={storeForm.logoUrl || ''}
                      onChange={(e) => setStoreForm({ ...storeForm, logoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono text-xs outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-300 block">Chamada Principal do Banner</label>
                      <input
                        type="text"
                        value={storeForm.bannerHeadline || ''}
                        onChange={(e) => setStoreForm({ ...storeForm, bannerHeadline: e.target.value })}
                        placeholder="Ex: Os melhores produtos reunidos com os"
                        className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white outline-none focus:border-pink-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-bold text-zinc-300 block">Texto com Gradiente Destaque</label>
                      <input
                        type="text"
                        value={storeForm.bannerHeadlineGradient || ''}
                        onChange={(e) => setStoreForm({ ...storeForm, bannerHeadlineGradient: e.target.value })}
                        placeholder="Ex: melhores preços."
                        className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-amber-300 font-extrabold outline-none focus:border-pink-500"
                      />

                      {/* Color Presets for Banner Gradient Text */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Presets Rápidos de Frases & Estilos
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { text: 'melhores preços.', color: 'text-amber-300', bg: 'from-amber-400 to-rose-400' },
                            { text: 'ofertas imperdíveis.', color: 'text-pink-400', bg: 'from-pink-500 to-purple-500' },
                            { text: 'maiores descontos do Brasil.', color: 'text-emerald-400', bg: 'from-emerald-400 to-cyan-400' },
                            { text: 'achadinhos exclusivos.', color: 'text-amber-400', bg: 'from-yellow-400 to-amber-500' },
                            { text: 'preços imbatíveis hoje.', color: 'text-rose-400', bg: 'from-rose-500 to-red-500' },
                          ].map((p, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setStoreForm({ ...storeForm, bannerHeadlineGradient: p.text })}
                              className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-extrabold text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${p.bg}`} />
                              <span>{p.text}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-zinc-300 block">Selos & Badges Promocionais (Presets Rápidos)</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-400 block">Selo 1 (Badge Superior)</label>
                        <input
                          type="text"
                          value={storeForm.badgeTag1 || ''}
                          onChange={(e) => setStoreForm({ ...storeForm, badgeTag1: e.target.value })}
                          placeholder="Ex: Curadoria Exclusiva"
                          className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-pink-300 font-extrabold outline-none focus:border-pink-500"
                        />
                        <div className="flex flex-wrap gap-1 pt-1">
                          {['Curadoria Exclusiva ✨', 'Seleção Oficial 🔥', 'Os Mais Vendidos ⭐', 'Virais do TikTok 🚀'].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setStoreForm({ ...storeForm, badgeTag1: t })}
                              className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 hover:border-pink-500/50 rounded-md text-[9px] font-bold text-pink-300 cursor-pointer"
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-400 block">Selo 2 (Segurança)</label>
                        <input
                          type="text"
                          value={storeForm.badgeTag2 || ''}
                          onChange={(e) => setStoreForm({ ...storeForm, badgeTag2: e.target.value })}
                          placeholder="Ex: Ofertas Verificadas"
                          className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-emerald-300 font-extrabold outline-none focus:border-pink-500"
                        />
                        <div className="flex flex-wrap gap-1 pt-1">
                          {['Ofertas Verificadas 🛡️', 'Links Seguros 🔒', 'Lojas de Confiança ✅', 'Menor Preço Garantido 💰'].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setStoreForm({ ...storeForm, badgeTag2: t })}
                              className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 rounded-md text-[9px] font-bold text-emerald-300 cursor-pointer"
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-400 block">Texto da Pílula Promocional</label>
                        <input
                          type="text"
                          value={storeForm.promoPillText || ''}
                          onChange={(e) => setStoreForm({ ...storeForm, promoPillText: e.target.value })}
                          placeholder="Ex: Até 40% OFF"
                          className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-amber-400 font-extrabold outline-none focus:border-pink-500"
                        />
                        <div className="flex flex-wrap gap-1 pt-1">
                          {['Até 50% OFF 🏷️', 'Frete Grátis 🚚', 'Cupom Ativo 🎁', 'Super Descontos ⚡'].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setStoreForm({ ...storeForm, promoPillText: t })}
                              className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 rounded-md text-[9px] font-bold text-amber-400 cursor-pointer"
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingStoreSettings}
                      className="px-6 py-2.5 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-700 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {savingStoreSettings ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Salvando no Banco...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Salvar Configurações da Loja</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
              {/* Security & Access Credentials Card */}
              <div className="p-6 rounded-3xl bg-zinc-800/40 border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-black text-base text-white flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-pink-500" />
                    Credenciais de Acesso Administrativo
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full w-fit">
                    Sessão Local Criptografada
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Altere o usuário e a senha para acesso ao Painel Administrativo.
                  As credenciais são salvas e sincronizadas diretamente no banco de dados Firestore da sua loja.
                </p>

                <form onSubmit={handleChangePasscode} className="space-y-3 pt-2">
                  {/* Username Setting */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300">Nome de Usuário Administrador</label>
                    <input
                      type="text"
                      value={adminUserSetting}
                      onChange={(e) => setAdminUserSetting(e.target.value)}
                      placeholder="Ex: admin..."
                      className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-xl text-white outline-none focus:border-pink-500 font-bold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-300">Nova Senha (Opcional)</label>
                      <div className="relative">
                        <input
                          type={showPasscode ? 'text' : 'password'}
                          value={newPasscode}
                          onChange={(e) => setNewPasscode(e.target.value)}
                          placeholder="Deixe em branco para manter a atual..."
                          className="w-full pl-3 pr-10 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-xl text-white outline-none focus:border-pink-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasscode(!showPasscode)}
                          className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white cursor-pointer"
                        >
                          {showPasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-300">Confirmar Nova Senha</label>
                      <input
                        type={showPasscode ? 'text' : 'password'}
                        value={confirmPasscode}
                        onChange={(e) => setConfirmPasscode(e.target.value)}
                        placeholder="Repita a nova senha..."
                        className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-xl text-white outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>

                  {passcodeMsg && (
                    <div
                      className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                        passcodeMsg.isError
                          ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                          : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{passcodeMsg.text}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-pink-600 to-amber-500 hover:from-pink-700 hover:to-amber-600 text-white font-bold text-xs rounded-xl transition-transform active:scale-95 cursor-pointer"
                    >
                      Salvar Credenciais
                    </button>

                    <button
                      type="button"
                      onClick={handleResetPasscodeToDefault}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Restaurar Padrão
                    </button>
                  </div>
                </form>
              </div>

              {/* Data Management Card */}
              <div className="p-6 rounded-3xl bg-zinc-800/40 border border-zinc-800 space-y-4">
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-pink-500" />
                  Gerenciamento de Dados & Métricas
                </h3>

                <div className="space-y-3 pt-2">
                  <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs text-white">Zerar Contador de Cliques</h4>
                      <p className="text-[11px] text-zinc-400">Reseta as métricas de acessos aos links de afiliados para 0.</p>
                    </div>
                    <button
                      onClick={handleResetClicks}
                      className="px-4 py-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-bold text-xs rounded-xl shrink-0 cursor-pointer"
                    >
                      Zerar Cliques
                    </button>
                  </div>

                  <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs text-white">Restaurar Catálogo Inicial Seed</h4>
                      <p className="text-[11px] text-zinc-400">Restaura os produtos e destaques virais de demonstração.</p>
                    </div>
                    <button
                      onClick={handleRestoreDatabase}
                      className="px-4 py-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 font-bold text-xs rounded-xl shrink-0 cursor-pointer"
                    >
                      Restaurar Inicial
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-white">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">{confirmModal.title}</h3>
                <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Ação de Confirmação</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isExecutingConfirm}
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isExecutingConfirm}
                onClick={async () => {
                  setIsExecutingConfirm(true);
                  try {
                    await confirmModal.onConfirm();
                  } catch (err) {
                    console.error('Confirmation action failed:', err);
                  } finally {
                    setIsExecutingConfirm(false);
                    setConfirmModal(null);
                  }
                }}
                className={`px-5 py-2 text-white font-extrabold text-xs rounded-xl shadow-lg cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ${
                  confirmModal.confirmVariant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {isExecutingConfirm ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Aguarde...</span>
                  </>
                ) : (
                  confirmModal.confirmText || 'Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
