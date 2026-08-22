var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");

// src/data/initialData.ts
var INITIAL_CATEGORIES = [
  { id: "todos", name: "Todos os Produtos", icon: "Sparkles" },
  { id: "tech", name: "Tech & Gadgets", icon: "Smartphone" },
  { id: "tendencias", name: "Tend\xEAncias & Destaques", icon: "Flame" },
  { id: "casa", name: "Casa & Setup", icon: "Home" },
  { id: "moda", name: "Moda & Estilo", icon: "ShoppingBag" },
  { id: "beleza", name: "Beleza & Autocuidado", icon: "Heart" }
];
var INITIAL_HIGHLIGHTS = [
  {
    id: "dia-dos-pais",
    title: "Especial Dia dos Pais",
    subtitle: "Gadgets, utilidades e presentes que todo pai tecnologico quer ganhar!",
    badge: "DESTAQUE DA SEMANA",
    bannerUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
    themeColor: "from-amber-600 via-rose-600 to-pink-600",
    iconName: "Gift",
    isActive: true,
    tagFilter: "dia-dos-pais"
  },
  {
    id: "dia-dos-namorados",
    title: "Especial Dia dos Namorados",
    subtitle: "Achadinhos rom\xE2nticos e presentes inesquec\xEDveis para surpreender seu amor!",
    badge: "EDICAO ESPECIAL",
    bannerUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80",
    themeColor: "from-pink-600 via-rose-500 to-purple-600",
    iconName: "Heart",
    isActive: true,
    tagFilter: "dia-dos-namorados"
  },
  {
    id: "virais-tiktok",
    title: 'Virais da "For You"',
    subtitle: "Os produtos que bateram milh\xF5es de visualiza\xE7\xF5es e voc\xEA precisa testar!",
    badge: "EM ALTA NO TIKTOK",
    bannerUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80",
    themeColor: "from-fuchsia-600 via-pink-500 to-purple-700",
    iconName: "Flame",
    isActive: true,
    tagFilter: "virais"
  }
];
var INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    title: "Lumin\xE1ria de P\xF4r do Sol Sunset Lamp RGB",
    description: "Transforme o clima do seu quarto ou cen\xE1rios de v\xEDdeos do TikTok com essa ilumina\xE7\xE3o quente e est\xE9tica. Rota\xE7\xE3o 360\xB0, m\xFAltiplos efeitos luminosos e controle por app.",
    price: 49.9,
    originalPrice: 89.9,
    imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80",
    affiliateUrl: "https://shopee.com.br",
    category: "Tend\xEAncias & Destaques",
    platform: "tiktok",
    badge: "Viral no TikTok",
    badgeIcon: "Flame",
    hasFreeShipping: true,
    highlightId: "virais-tiktok",
    isFeatured: true,
    isActive: true,
    clicksCount: 342,
    rating: 4.9,
    reviewsCount: 128,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "prod-2",
    title: "Mini Projetor Port\xE1til Smart 4K Wi-Fi Android",
    description: "Cinema no teto do seu quarto! Projetor super compacto com suporte a 4K, Wi-Fi integrado, alto-falante potente e ajuste autom\xE1tico de foco. Presente perfeito para o Dia dos Pais ou Namorados.",
    price: 289,
    originalPrice: 450,
    imageUrl: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=800&q=80",
    affiliateUrl: "https://amazon.com.br",
    category: "Tech & Gadgets",
    platform: "amazon",
    badge: "Ideia Dia dos Pais",
    badgeIcon: "Gift",
    highlightId: "dia-dos-pais",
    isFeatured: true,
    isActive: true,
    clicksCount: 512,
    rating: 4.8,
    reviewsCount: 215,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "prod-3",
    title: "Umidificador e Aromatizador de Ar com Efeito Chama LED",
    description: "Parece fogo de verdade! Esse umidificador ultra-silencioso deixa o ar fresco, difunde \xF3leos essenciais e decora a sua mesa de trabalho com ilumina\xE7\xE3o de chama hipnotizante.",
    price: 79.9,
    originalPrice: 129.9,
    imageUrl: "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=800&q=80",
    affiliateUrl: "https://shopee.com.br",
    category: "Casa & Setup",
    platform: "shopee",
    badge: "Queridinho dos Namorados",
    badgeIcon: "Heart",
    hasFreeShipping: true,
    highlightId: "dia-dos-namorados",
    isFeatured: true,
    isActive: true,
    clicksCount: 420,
    rating: 4.9,
    reviewsCount: 189,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "prod-4",
    title: "Fone de Ouvido Bluetooth TWS Sem Fio com Display LED",
    description: "\xC1udio cristalino com graves marcantes, isolamento ac\xFAstico e case carregadora inteligente que mostra a porcentagem exata de bateria. Resistente a suor e respingos.",
    price: 59.9,
    originalPrice: 119,
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
    affiliateUrl: "https://aliexpress.com",
    category: "Tech & Gadgets",
    platform: "aliexpress",
    badge: "Presente Top Dia dos Pais",
    badgeIcon: "Gift",
    highlightId: "dia-dos-pais",
    isFeatured: false,
    isActive: true,
    clicksCount: 280,
    rating: 4.7,
    reviewsCount: 94,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "prod-5",
    title: "Kit Vlogger Microfone Sem Fio Lapela para Celular iPhone / Android",
    description: "Capture \xE1udio profissional sem chiado para seus v\xEDdeos no TikTok e Reels! Conex\xE3o plug and play autom\xE1tica, longo alcance de at\xE9 20 metros e redu\xE7\xE3o de ru\xEDdo ativa.",
    price: 68.5,
    originalPrice: 135,
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    affiliateUrl: "https://shopee.com.br",
    category: "Tend\xEAncias & Destaques",
    platform: "instagram",
    badge: "Essencial para Creators",
    badgeIcon: "Camera",
    highlightId: "virais-tiktok",
    isFeatured: true,
    isActive: true,
    clicksCount: 610,
    rating: 5,
    reviewsCount: 310,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "prod-6",
    title: "Rel\xF3gio Smartwatch Esportivo com Monitor de Sa\xFAde e Chamadas",
    description: "Smartwatch completo com tela HD sens\xEDvel ao toque, faz e recebe chamadas, mede frequ\xEAncia card\xEDaca, oxigena\xE7\xE3o no sangue, passos e notifica\xE7\xF5es do WhatsApp/Instagram.",
    price: 139.9,
    originalPrice: 249.9,
    imageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
    affiliateUrl: "https://mercadolivre.com.br",
    category: "Tech & Gadgets",
    platform: "mercadolivre",
    badge: "Destaque Dia dos Pais",
    badgeIcon: "Gift",
    hasFreeShipping: true,
    highlightId: "dia-dos-pais",
    isFeatured: true,
    isActive: true,
    clicksCount: 390,
    rating: 4.8,
    reviewsCount: 162,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "prod-7",
    title: "Lumin\xE1ria de Mesa Articulada em Madeira Escandinava Minimalista",
    description: "O toque de sofistica\xE7\xE3o que faltava no seu est\xFAdio ou mesa de trabalho. Base em madeira maci\xE7a, bra\xE7o ajust\xE1vel e acabamento met\xE1lico matte impec\xE1vel.",
    price: 119,
    originalPrice: 189,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    affiliateUrl: "https://amazon.com.br",
    category: "Casa & Setup",
    platform: "amazon",
    badge: "Design Minimalista",
    badgeIcon: "Sparkles",
    highlightId: "dia-dos-namorados",
    isFeatured: false,
    isActive: true,
    clicksCount: 195,
    rating: 4.9,
    reviewsCount: 77,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "prod-8",
    title: "Organizador Girat\xF3rio 360\xB0 de Acr\xEDlico para Maquiagem e Skincare",
    description: "Chega de bagun\xE7a no banheiro ou penteadeira! Armazena cremes, perfumes, pinc\xE9is e maquiagens com acesso f\xE1cil de 360 graus. Altura das prateleiras ajust\xE1vel.",
    price: 64.9,
    originalPrice: 110,
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    affiliateUrl: "https://shopee.com.br",
    category: "Beleza & Autocuidado",
    platform: "shopee",
    badge: "Queridinho do Instagram",
    badgeIcon: "Heart",
    highlightId: "dia-dos-namorados",
    isFeatured: true,
    isActive: true,
    clicksCount: 480,
    rating: 4.9,
    reviewsCount: 204,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "prod-9",
    title: "Copo T\xE9rmico Manta Vacuum Inox com Tampa e Abridor de Garrafa 473ml",
    description: "Mant\xE9m sua bebida trincando de gelada por at\xE9 5 horas! A\xE7o inox de alta durabilidade, parede dupla com isolamento a v\xE1cuo e abridor embutido na tampa. Ideal para churrasco e rol\xEAs.",
    price: 45,
    originalPrice: 89,
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    affiliateUrl: "https://shopee.com.br",
    category: "Casa & Setup",
    platform: "shopee",
    badge: "Sucesso Dia dos Pais",
    badgeIcon: "Gift",
    hasFreeShipping: true,
    highlightId: "dia-dos-pais",
    isFeatured: false,
    isActive: true,
    clicksCount: 520,
    rating: 4.8,
    reviewsCount: 230,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "prod-10",
    title: "Mini Processador e Triturador El\xE9trico de Alimentos sem Fio",
    description: "Triture alho, cebola, pimentas e temperos em 5 segundos sem sujar as m\xE3os! Recarreg\xE1vel via USB, l\xE2minas duplas em a\xE7o inox super afiadas.",
    price: 34.9,
    originalPrice: 69.9,
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    affiliateUrl: "https://shopee.com.br",
    category: "Tend\xEAncias & Destaques",
    platform: "tiktok",
    badge: "Baratinho \xDAtil",
    badgeIcon: "Zap",
    highlightId: "virais-tiktok",
    isFeatured: false,
    isActive: true,
    clicksCount: 690,
    rating: 4.7,
    reviewsCount: 340,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];

// server.ts
var PORT = 3e3;
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var DB_FILE = import_path.default.join(DATA_DIR, "db.json");
function initDatabase() {
  if (!import_fs.default.existsSync(DATA_DIR)) {
    import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!import_fs.default.existsSync(DB_FILE)) {
    const initialDb = {
      products: INITIAL_PRODUCTS,
      highlights: INITIAL_HIGHLIGHTS,
      categories: INITIAL_CATEGORIES,
      clickLogs: [
        {
          id: "log-1",
          productId: "prod-1",
          productTitle: "Lumin\xE1ria de P\xF4r do Sol Sunset Lamp RGB",
          platform: "tiktok",
          timestamp: new Date(Date.now() - 36e5 * 2).toISOString()
        },
        {
          id: "log-2",
          productId: "prod-5",
          productTitle: "Kit Vlogger Microfone Sem Fio Lapela",
          platform: "instagram",
          timestamp: new Date(Date.now() - 36e5 * 5).toISOString()
        }
      ]
    };
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
    return initialDb;
  }
  try {
    const raw = import_fs.default.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.categories || parsed.categories.length === 0) {
      parsed.categories = INITIAL_CATEGORIES;
    }
    return parsed;
  } catch (err) {
    console.error("Error reading database, recreating default:", err);
    const initialDb = {
      products: INITIAL_PRODUCTS,
      highlights: INITIAL_HIGHLIGHTS,
      categories: INITIAL_CATEGORIES,
      clickLogs: []
    };
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
    return initialDb;
  }
}
function saveDatabase(db) {
  try {
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database:", err);
  }
}
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json({ limit: "10mb" }));
  let db = initDatabase();
  const apiRouter = import_express.default.Router();
  apiRouter.post("/admin/verify", (req, res) => {
    const { code } = req.body;
    if (code === "wooboxadm99") {
      return res.json({ success: true, message: "C\xF3digo administrativo verificado com sucesso!" });
    }
    return res.status(401).json({ success: false, message: "C\xF3digo administrativo incorreto." });
  });
  apiRouter.get("/products", (req, res) => {
    const { search, category, minPrice, maxPrice, highlightId, platform, activeOnly } = req.query;
    let filtered = [...db.products];
    if (activeOnly === "true") {
      filtered = filtered.filter((p) => p.isActive);
    }
    if (search && typeof search === "string") {
      const q = search.toLowerCase().trim();
      if (q !== "wooboxadm99") {
        filtered = filtered.filter(
          (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.badge && p.badge.toLowerCase().includes(q)
        );
      }
    }
    if (category && typeof category === "string" && category !== "todos") {
      filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (highlightId && typeof highlightId === "string") {
      filtered = filtered.filter((p) => p.highlightId === highlightId);
    }
    if (platform && typeof platform === "string" && platform !== "todas") {
      filtered = filtered.filter((p) => p.platform === platform);
    }
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) filtered = filtered.filter((p) => p.price >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) filtered = filtered.filter((p) => p.price <= max);
    }
    res.json(filtered);
  });
  apiRouter.get("/products/:id", (req, res) => {
    const product = db.products.find((p) => p.id === req.params.id);
    if (!product) return res.status(404).json({ message: "Produto n\xE3o encontrado" });
    res.json(product);
  });
  apiRouter.post("/products", (req, res) => {
    const newProduct = {
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      title: req.body.title || "Novo Produto",
      description: req.body.description || "",
      price: parseFloat(req.body.price) || 0,
      originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : void 0,
      imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
      gallery: req.body.gallery || [],
      affiliateUrl: req.body.affiliateUrl || "https://shopee.com.br",
      category: req.body.category || "Achadinhos TikTok",
      platform: req.body.platform || "tiktok",
      badge: req.body.badge || "",
      highlightId: req.body.highlightId || void 0,
      isFeatured: Boolean(req.body.isFeatured),
      isActive: req.body.isActive !== void 0 ? Boolean(req.body.isActive) : true,
      clicksCount: 0,
      rating: parseFloat(req.body.rating) || 5,
      reviewsCount: parseInt(req.body.reviewsCount) || 10,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.products.unshift(newProduct);
    saveDatabase(db);
    res.status(201).json(newProduct);
  });
  apiRouter.put("/products/:id", (req, res) => {
    const index = db.products.findIndex((p) => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Produto n\xE3o encontrado" });
    const existing = db.products[index];
    const updated = {
      ...existing,
      ...req.body,
      price: req.body.price !== void 0 ? parseFloat(req.body.price) : existing.price,
      originalPrice: req.body.originalPrice !== void 0 ? req.body.originalPrice ? parseFloat(req.body.originalPrice) : void 0 : existing.originalPrice,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.products[index] = updated;
    saveDatabase(db);
    res.json(updated);
  });
  apiRouter.delete("/products/:id", (req, res) => {
    const index = db.products.findIndex((p) => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Produto n\xE3o encontrado" });
    const deleted = db.products.splice(index, 1)[0];
    saveDatabase(db);
    res.json({ message: "Produto removido com sucesso", deleted });
  });
  apiRouter.post("/products/:id/click", (req, res) => {
    const product = db.products.find((p) => p.id === req.params.id);
    if (!product) return res.status(404).json({ message: "Produto n\xE3o encontrado" });
    product.clicksCount = (product.clicksCount || 0) + 1;
    const clickLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      productId: product.id,
      productTitle: product.title,
      platform: product.platform,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      referrer: req.body.referrer || "direct",
      userAgent: req.headers["user-agent"] || ""
    };
    db.clickLogs.unshift(clickLog);
    if (db.clickLogs.length > 1e3) {
      db.clickLogs = db.clickLogs.slice(0, 1e3);
    }
    saveDatabase(db);
    res.json({ success: true, clicksCount: product.clicksCount, affiliateUrl: product.affiliateUrl });
  });
  apiRouter.get("/highlights", (req, res) => {
    res.json(db.highlights);
  });
  apiRouter.post("/highlights", (req, res) => {
    const newHighlight = {
      id: req.body.id || `hl-${Date.now()}`,
      title: req.body.title || "Novo Destaque",
      subtitle: req.body.subtitle || "",
      badge: req.body.badge || "DESTAQUE",
      bannerUrl: req.body.bannerUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
      themeColor: req.body.themeColor || "from-pink-600 to-purple-600",
      iconName: req.body.iconName || "Gift",
      isActive: req.body.isActive !== void 0 ? Boolean(req.body.isActive) : true,
      tagFilter: req.body.tagFilter || ""
    };
    db.highlights.push(newHighlight);
    saveDatabase(db);
    res.status(201).json(newHighlight);
  });
  apiRouter.put("/highlights/:id", (req, res) => {
    const index = db.highlights.findIndex((h) => h.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Destaque n\xE3o encontrado" });
    const updated = { ...db.highlights[index], ...req.body };
    db.highlights[index] = updated;
    saveDatabase(db);
    res.json(updated);
  });
  apiRouter.delete("/highlights/:id", (req, res) => {
    const index = db.highlights.findIndex((h) => h.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Destaque n\xE3o encontrado" });
    const deleted = db.highlights.splice(index, 1)[0];
    saveDatabase(db);
    res.json({ message: "Destaque removido com sucesso", deleted });
  });
  apiRouter.get("/categories", (req, res) => {
    res.json(db.categories || INITIAL_CATEGORIES);
  });
  apiRouter.post("/categories", (req, res) => {
    const name = (req.body.name || "").trim();
    if (!name) return res.status(400).json({ message: "Nome da categoria \xE9 obrigat\xF3rio" });
    const newCategory = {
      id: req.body.id || `cat-${Date.now()}`,
      name,
      icon: req.body.icon || "Tag"
    };
    if (!db.categories) db.categories = [...INITIAL_CATEGORIES];
    db.categories.push(newCategory);
    saveDatabase(db);
    res.status(201).json(newCategory);
  });
  apiRouter.put("/categories/:id", (req, res) => {
    if (!db.categories) db.categories = [...INITIAL_CATEGORIES];
    const index = db.categories.findIndex((c) => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Categoria n\xE3o encontrada" });
    const existing = db.categories[index];
    const updated = {
      ...existing,
      name: req.body.name !== void 0 ? req.body.name.trim() : existing.name,
      icon: req.body.icon !== void 0 ? req.body.icon : existing.icon
    };
    db.categories[index] = updated;
    saveDatabase(db);
    res.json(updated);
  });
  apiRouter.delete("/categories/:id", (req, res) => {
    if (!db.categories) db.categories = [...INITIAL_CATEGORIES];
    const index = db.categories.findIndex((c) => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Categoria n\xE3o encontrada" });
    if (db.categories[index].id === "todos") {
      return res.status(400).json({ message: "N\xE3o \xE9 poss\xEDvel excluir a categoria padr\xE3o 'Todos'" });
    }
    const deleted = db.categories.splice(index, 1)[0];
    saveDatabase(db);
    res.json({ message: "Categoria removida com sucesso", deleted });
  });
  function parseAndNormalizePrice(val) {
    if (val === null || val === void 0) return null;
    if (typeof val === "number") {
      if (isNaN(val) || val <= 0) return null;
      if (val > 1e5) return Math.round(val / 1e5 * 100) / 100;
      return Math.round(val * 100) / 100;
    }
    const s = String(val).trim();
    if (!s) return null;
    const matchWithCents = s.match(/(?:R\$\s*)?([\d]{1,3}(?:\.[\d]{3})*\,[\d]{1,2}|[\d]+[.,][\d]{1,2})/i);
    if (matchWithCents) {
      let clean = matchWithCents[1];
      if (clean.includes(".") && clean.includes(",")) {
        clean = clean.replace(/\./g, "").replace(",", ".");
      } else if (clean.includes(",")) {
        clean = clean.replace(",", ".");
      }
      const num = parseFloat(clean);
      if (!isNaN(num) && num >= 0.5 && num < 1e5) {
        return Math.round(num * 100) / 100;
      }
    }
    const matchInteger = s.match(/(?:R\$\s*)?([\d]{1,3}(?:\.[\d]{3})+|[\d]{2,5})/i);
    if (matchInteger) {
      let clean = matchInteger[1].replace(/\./g, "");
      const num = parseFloat(clean);
      if (!isNaN(num) && num >= 0.5 && num < 1e5) {
        return Math.round(num * 100) / 100;
      }
    }
    return null;
  }
  function extractPriceFromJsonLD(html) {
    let currentPrice = null;
    let oldPrice = null;
    const ldJsonScripts = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
    for (const scriptTag of ldJsonScripts) {
      try {
        const jsonText = scriptTag[1].trim();
        const ld = JSON.parse(jsonText);
        const items = Array.isArray(ld) ? ld : [ld];
        for (const item of items) {
          const type = item["@type"];
          const isProduct = type === "Product" || Array.isArray(type) && type.includes("Product");
          const offers = item.offers || (isProduct ? item : null);
          if (offers) {
            const offerList = Array.isArray(offers) ? offers : [offers];
            for (const offer of offerList) {
              const p = parseAndNormalizePrice(offer.price ?? offer.lowPrice);
              if (p && (!currentPrice || p < currentPrice)) {
                currentPrice = p;
              }
              const op = parseAndNormalizePrice(offer.highPrice ?? offer.originalPrice ?? offer.listPrice);
              if (op && (!oldPrice || op > oldPrice)) {
                oldPrice = op;
              }
            }
          } else if (isProduct && item.price !== void 0) {
            const p = parseAndNormalizePrice(item.price);
            if (p && (!currentPrice || p < currentPrice)) {
              currentPrice = p;
            }
          }
        }
      } catch (e) {
      }
    }
    return { currentPrice, oldPrice };
  }
  function extractPriceFromMeta(html) {
    let currentPrice = null;
    let oldPrice = null;
    const priceMetaPatterns = [
      /<meta\s+(?:property|name|itemprop)=["'](?:product:price:amount|price|og:price:amount|twitter:data1)["']\s+content=["']([^"']+)["']/gi,
      /<meta\s+content=["']([^"']+)["']\s+(?:property|name|itemprop)=["'](?:product:price:amount|price|og:price:amount|twitter:data1)["']/gi
    ];
    for (const pattern of priceMetaPatterns) {
      const matches = [...html.matchAll(pattern)];
      for (const m of matches) {
        const p = parseAndNormalizePrice(m[1]);
        if (p && (!currentPrice || p < currentPrice)) {
          currentPrice = p;
        }
      }
    }
    const origMetaPatterns = [
      /<meta\s+(?:property|name|itemprop)=["'](?:product:original_price:amount|original_price|list_price)["']\s+content=["']([^"']+)["']/gi,
      /<meta\s+content=["']([^"']+)["']\s+(?:property|name|itemprop)=["'](?:product:original_price:amount|original_price|list_price)["']/gi
    ];
    for (const pattern of origMetaPatterns) {
      const matches = [...html.matchAll(pattern)];
      for (const m of matches) {
        const op = parseAndNormalizePrice(m[1]);
        if (op && (!oldPrice || op > oldPrice)) {
          oldPrice = op;
        }
      }
    }
    return { currentPrice, oldPrice };
  }
  function extractPriceFromEmbeddedJson(html) {
    let currentPrice = null;
    let oldPrice = null;
    const stateMatches = [
      ...html.matchAll(/window\.__PRELOADED_STATE__\s*=\s*(\{[\s\S]*?\});/gi),
      ...html.matchAll(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/gi),
      ...html.matchAll(/<script[^>]*>[\s\S]*?var\s+(?:initialState|__PRELOADED_STATE__|pageData)\s*=\s*(\{[\s\S]*?\});<\/script>/gi)
    ];
    for (const sm of stateMatches) {
      try {
        const rawJson = sm[1];
        const priceValMatches = [
          ...rawJson.matchAll(/"price"\s*:\s*\{\s*"value"\s*:\s*([\d.]+)/gi),
          ...rawJson.matchAll(/"currentPrice"\s*:\s*([\d.]+)/gi),
          ...rawJson.matchAll(/"sale_price"\s*:\s*([\d.]+)/gi),
          ...rawJson.matchAll(/"sellingPrice"\s*:\s*([\d.]+)/gi)
        ];
        for (const pm of priceValMatches) {
          const p = parseAndNormalizePrice(pm[1]);
          if (p && (!currentPrice || p < currentPrice)) {
            currentPrice = p;
          }
        }
        const origValMatches = [
          ...rawJson.matchAll(/"original_price"\s*:\s*\{\s*"value"\s*:\s*([\d.]+)/gi),
          ...rawJson.matchAll(/"original_price"\s*:\s*([\d.]+)/gi),
          ...rawJson.matchAll(/"oldPrice"\s*:\s*([\d.]+)/gi),
          ...rawJson.matchAll(/"originalPrice"\s*:\s*([\d.]+)/gi),
          ...rawJson.matchAll(/"listPrice"\s*:\s*([\d.]+)/gi)
        ];
        for (const opm of origValMatches) {
          const op = parseAndNormalizePrice(opm[1]);
          if (op && (!oldPrice || op > oldPrice)) {
            oldPrice = op;
          }
        }
      } catch (e) {
      }
    }
    return { currentPrice, oldPrice };
  }
  function extractPriceFromVisibleHtml(html) {
    let currentPrice = null;
    let oldPrice = null;
    const mainPdpBlock = html.match(/class=["'][^"']*(?:ui-pdp-price|ui-pdp-main|ui-pdp-container)[^"']*["'][\s\S]{1,3000}?<\/div>\s*<\/div>/i) || html.match(/id=["']priceblock_(?:dealprice|ourprice)["'][^>]*>[\s\S]{1,500}/i) || html.match(/class=["'][^"']*a-price\s+a-text-price\s+a-size-medium[^"']*["'][\s\S]{1,500}/i);
    const containerText = mainPdpBlock ? mainPdpBlock[0] : html;
    const oldPriceBlock = containerText.match(/class=["'][^"']*(?:ui-pdp-price__original-value|andes-money-amount--previous|ui-pdp-price__part--medium\s+s)[^"']*["'][\s\S]{1,500}/i) || containerText.match(/<s[\s\S]{1,500}?<\/s>/i);
    if (oldPriceBlock) {
      const oldStr = oldPriceBlock[0];
      const frac2 = oldStr.match(/andes-money-amount__fraction["'][^>]*>([\d.]+)</i) || oldStr.match(/price-tag-fraction["'][^>]*>([\d.]+)</i);
      if (frac2) {
        const cleanFrac = frac2[1].replace(/\./g, "");
        const centsMatch = oldStr.match(/andes-money-amount__cents["'][^>]*>([\d]+)</i) || oldStr.match(/price-tag-cents["'][^>]*>([\d]+)</i);
        const cents = centsMatch ? centsMatch[1] : "00";
        oldPrice = parseAndNormalizePrice(`${cleanFrac}.${cents}`);
      }
    }
    const mainPriceMatch = containerText.match(/class=["'][^"']*(?:ui-pdp-price__second-line|andes-money-amount--main|ui-pdp-price__part--large)[^"']*["'][\s\S]{1,1500}/i);
    const mainStr = mainPriceMatch ? mainPriceMatch[0] : containerText;
    const frac = mainStr.match(/andes-money-amount__fraction["'][^>]*>([\d.]+)</i) || mainStr.match(/price-tag-fraction["'][^>]*>([\d.]+)</i);
    if (frac) {
      const cleanFrac = frac[1].replace(/\./g, "");
      const centsMatch = mainStr.match(/andes-money-amount__cents["'][^>]*>([\d]+)</i) || mainStr.match(/price-tag-cents["'][^>]*>([\d]+)</i);
      const cents = centsMatch ? centsMatch[1] : "00";
      currentPrice = parseAndNormalizePrice(`${cleanFrac}.${cents}`);
    }
    if (!currentPrice) {
      const dePorMatch = containerText.match(/de\s+R\$\s*([\d.,]+)\s+por\s+R\$\s*([\d.,]+)/i);
      if (dePorMatch) {
        oldPrice = parseAndNormalizePrice(dePorMatch[1]);
        currentPrice = parseAndNormalizePrice(dePorMatch[2]);
      }
    }
    if (!currentPrice) {
      const genericMatches = [...containerText.matchAll(/R\$\s*([\d]{1,3}(?:\.[\d]{3})*,[\d]{2})/g)].map((m) => parseAndNormalizePrice(m[1])).filter((p) => p !== null);
      if (genericMatches.length === 1) {
        currentPrice = genericMatches[0];
      } else if (genericMatches.length > 1) {
        currentPrice = Math.min(...genericMatches);
        const highest = Math.max(...genericMatches);
        if (highest > currentPrice) oldPrice = highest;
      }
    }
    return { currentPrice, oldPrice };
  }
  function parseBrlPriceValue(str) {
    return parseAndNormalizePrice(str);
  }
  function cleanHtmlText(str) {
    if (!str) return "";
    return str.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  }
  function detectFreeShipping(html) {
    if (/"shippingDetails"[\s\S]{0,400}?"price"\s*:\s*"?0(\.0+)?"?/i.test(html)) return true;
    if (/"freeShipping"\s*:\s*true/i.test(html)) return true;
    if (/ui-pdp-color--green[^"']*"[^>]*>\s*Frete\s*gr[aá]tis/i.test(html)) return true;
    if (/class=["'][^"']*ui-pdp-shipping[^"']*["'][\s\S]{0,400}?[Gg]r[aá]tis/i.test(html)) return true;
    if (/id=["']deliveryBlockMessage["'][\s\S]{0,300}?(FREE|GR[ÁA]TIS)/i.test(html)) return true;
    const positivePatterns = [
      /frete\s*gr[aá]tis/i,
      /envio\s*gr[aá]tis/i,
      /entrega\s*gr[aá]tis/i,
      /free\s*shipping/i,
      /free\s*delivery/i
    ];
    const hasPositiveMention = positivePatterns.some((p) => p.test(html));
    if (!hasPositiveMention) return false;
    const negatedPatterns = [
      /(n[aã]o\s+(possui|tem|inclui|oferece)|sem)\s+(o\s+)?frete\s*gr[aá]tis/i,
      /frete\s*gr[aá]tis\s+(n[aã]o\s+)?(dispon[ií]vel\s+)?(apenas|somente)\s+(para|em)/i
    ];
    const isNegated = negatedPatterns.some((p) => p.test(html));
    return !isNegated;
  }
  let aiClient = null;
  function getGeminiClient() {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new import_genai.GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
    return aiClient;
  }
  function generateSmartDescription(title, platform, rawDesc) {
    const cleanDesc = (rawDesc || "").trim();
    const lowerDesc = cleanDesc.toLowerCase();
    const isGenericOrBad = !cleanDesc || cleanDesc.length < 25 || lowerDesc.includes("wooboxshop") || lowerDesc.includes("visite a p\xE1gina") || lowerDesc.includes("encontre todos os produtos") || lowerDesc.includes("compre no mercado livre") || lowerDesc.includes("confira os produtos") || lowerDesc.includes("loja oficial no mercado livre") || lowerDesc.includes("compre com frete gr\xE1tis no mercado livre");
    if (!isGenericOrBad) {
      return cleanDesc;
    }
    const cleanTitle = title ? title.replace(/^(Achadinho|Produto|Oferta|Destaque)[^:-]*[:-]\s*/i, "").trim() : "Produto Selecionado";
    if (platform === "mercadolivre") {
      return `\u26A1 ${cleanTitle} \u2014 Oferta oficial imperd\xEDvel com garantia, alta avalia\xE7\xE3o e entrega super r\xE1pida! Aproveite o desconto por tempo limitado.`;
    } else if (platform === "shopee") {
      return `\u{1F525} ${cleanTitle} \u2014 O achadinho campe\xE3o de vendas com excelente custo-benef\xEDcio e avalia\xE7\xE3o 5 estrelas dos compradores.`;
    } else if (platform === "amazon") {
      return `\u{1F4E6} ${cleanTitle} \u2014 Item de alta qualidade com selo Amazon Prime, garantia de proced\xEAncia e envio expresso.`;
    } else {
      return `\u2728 ${cleanTitle} \u2014 Lan\xE7amento exclusivo com garantia e entrega r\xE1pida pela loja oficial. Garanta o seu com desconto especial!`;
    }
  }
  async function generateCommercialDescriptionWithGemini(title, platform, price, originalPrice, rawDesc) {
    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `Voc\xEA \xE9 um especialista em copywriting para e-commerce e criador de conte\xFAdo de achadinhos virais (Instagram, TikTok e WhatsApp).
Crie uma descri\xE7\xE3o comercial incrivelmente atraente, persuasiva e criativa em Portugu\xEAs do Brasil para o seguinte produto:

T\xEDtulo do Produto: "${title}"
Plataforma: ${platform}
Pre\xE7o de Oferta Atual: R$ ${price.toFixed(2).replace(".", ",")}
${originalPrice ? `Pre\xE7o Original (De): R$ ${originalPrice.toFixed(2).replace(".", ",")}` : ""}
Detalhes Adicionais da P\xE1gina: "${rawDesc || "Nenhum"}"

Diretrizes Obrigat\xF3rias:
1. Escreva uma descri\xE7\xE3o altamente persuasiva focando em utilidade, benef\xEDcios e custo-benef\xEDcio do produto.
2. Inclua de 3 a 5 emojis adequados e chamativos.
3. Mantenha o texto objetivo, fluido e f\xE1cil de ler nas redes sociais (entre 30 e 70 palavras).
4. N\xC3O inclua sauda\xE7\xF5es, introdu\xE7\xF5es ("Aqui est\xE1 a descri\xE7\xE3o:") ou aspas ao redor.
5. N\xC3O coloque frases gen\xE9ricas como "visite a p\xE1gina", "confira os produtos" ou "veja no site".
6. Retorne APENAS a descri\xE7\xE3o pronta para publica\xE7\xE3o.`;
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt
        });
        const text = response.text?.trim();
        if (text && text.length > 25) {
          return text.replace(/^["']|["']$/g, "").trim();
        }
      } catch (err) {
        console.error("Erro ao gerar descri\xE7\xE3o no Gemini:", err);
      }
    }
    return generateSmartDescription(title, platform, rawDesc);
  }
  apiRouter.post("/autofill", async (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL inv\xE1lida" });
    }
    const lowerUrl = url.toLowerCase();
    let platform = "outros";
    let badge = "\u2728 Oferta Selecionada";
    if (lowerUrl.includes("shopee") || lowerUrl.includes("shope.ee")) {
      platform = "shopee";
      badge = "\u{1F525} Achadinho Shopee";
    } else if (lowerUrl.includes("amazon") || lowerUrl.includes("amzn.to") || lowerUrl.includes("a.co")) {
      platform = "amazon";
      badge = "\u26A1 Oferta Prime Amazon";
    } else if (lowerUrl.includes("mercadolivre") || lowerUrl.includes("mercado.livre") || lowerUrl.includes("meli.la") || lowerUrl.includes("mlb")) {
      platform = "mercadolivre";
      badge = "\u{1F4E6} Entrega R\xE1pida ML";
    } else if (lowerUrl.includes("tiktok") || lowerUrl.includes("vt.tiktok")) {
      platform = "tiktok";
      badge = "\u{1F525} Viral no TikTok";
    } else if (lowerUrl.includes("aliexpress") || lowerUrl.includes("s.click.aliexpress")) {
      platform = "aliexpress";
      badge = "\u{1F310} Importado Choice";
    } else if (lowerUrl.includes("instagram") || lowerUrl.includes("instagr.am")) {
      platform = "instagram";
      badge = "\u{1F4F8} Destaque Instagram";
    }
    let extractedTitle = "";
    let extractedImage = "";
    let extractedDescription = "";
    let extractedPrice = null;
    let extractedOriginalPrice = null;
    let hasFreeShipping = false;
    const candidatePrices = [];
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8"
        },
        redirect: "follow",
        signal: AbortSignal.timeout(5500)
      });
      if (response.ok) {
        const html = await response.text();
        hasFreeShipping = detectFreeShipping(html);
        const ogTitleMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:title|twitter:title|title)["']\s+content=["']([^"']+)["']/i) || html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:title|twitter:title|title)["']/i) || html.match(/<title>([^<]+)<\/title>/i);
        if (ogTitleMatch) extractedTitle = cleanHtmlText(ogTitleMatch[1]);
        if (extractedTitle) {
          extractedTitle = extractedTitle.replace(/\s*\|\s*MercadoLivre\.com\.br$/i, "").replace(/\s*\|\s*Mercado\s*Livre$/i, "").replace(/\s*-\s*Mercado\s*Livre$/i, "").replace(/\s*\|\s*Shopee\s*Brasil$/i, "").replace(/\s*:\s*Amazon\.com\.br.*$/i, "").trim();
        }
        const ogImageMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:image|twitter:image|image)["']\s+content=["']([^"']+)["']/i) || html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:image|twitter:image|image)["']/i);
        if (ogImageMatch) extractedImage = ogImageMatch[1];
        const ogDescMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:description|twitter:description|description)["']\s+content=["']([^"']+)["']/i) || html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:description|twitter:description|description)["']/i);
        if (ogDescMatch) extractedDescription = cleanHtmlText(ogDescMatch[1]);
        const extractors = [
          extractPriceFromJsonLD,
          extractPriceFromMeta,
          extractPriceFromEmbeddedJson,
          extractPriceFromVisibleHtml
        ];
        for (const extractor of extractors) {
          const result = extractor(html);
          if (result.currentPrice !== null && result.currentPrice !== void 0 && result.currentPrice > 0) {
            extractedPrice = result.currentPrice;
            if (result.oldPrice && result.oldPrice > result.currentPrice) {
              extractedOriginalPrice = result.oldPrice;
            }
            break;
          }
        }
        if (extractedPrice && !extractedOriginalPrice) {
          for (const extractor of extractors) {
            const result = extractor(html);
            if (result.oldPrice && result.oldPrice > extractedPrice) {
              extractedOriginalPrice = result.oldPrice;
              break;
            }
          }
        }
      }
    } catch (err) {
      console.log("Autofill fetch timeout/error:", err);
    }
    let title = extractedTitle.trim();
    let imageUrl = extractedImage.trim();
    let price = extractedPrice;
    let originalPrice = extractedOriginalPrice;
    let category = "Tend\xEAncias & Destaques";
    if (price && originalPrice && originalPrice <= price) {
      originalPrice = null;
    }
    if (!price) {
      if (platform === "mercadolivre") {
        category = "Tech & Gadgets";
        price = 99.9;
      } else if (platform === "shopee") {
        category = "Casa & Setup";
        price = 49.9;
      } else if (platform === "amazon") {
        category = "Tech & Gadgets";
        price = 149.9;
      } else {
        price = 69.9;
      }
    }
    if (!title) {
      if (platform === "mercadolivre") title = "Achadinho Oficial Mercado Livre - Envio R\xE1pido";
      else if (platform === "shopee") title = "Achadinho Shopee Viral do TikTok";
      else if (platform === "amazon") title = "Produto Selecionado Amazon Prime";
      else title = "Produto Destaque Selecionado";
    }
    const aiRefPrice = price || originalPrice || 99.9;
    const description = await generateCommercialDescriptionWithGemini(
      title,
      platform,
      aiRefPrice,
      null,
      extractedDescription
    );
    if (!imageUrl) {
      if (platform === "mercadolivre") imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
      else if (platform === "shopee") imageUrl = "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80";
      else if (platform === "amazon") imageUrl = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80";
      else imageUrl = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80";
    }
    res.json({
      title,
      description,
      price,
      // Preço atual/promocional realmente encontrado na página (ou estimativa, se nada foi extraído)
      originalPrice,
      // Preço "de" riscado/anterior, somente quando genuinamente distinto do atual
      hasFreeShipping,
      category,
      platform,
      badge,
      imageUrl,
      affiliateUrl: url
    });
  });
  apiRouter.get("/metrics", (req, res) => {
    const totalClicks = db.products.reduce((acc, p) => acc + (p.clicksCount || 0), 0);
    const totalProducts = db.products.length;
    const activeProducts = db.products.filter((p) => p.isActive).length;
    const totalHighlights = db.highlights.length;
    const topProducts = [...db.products].sort((a, b) => (b.clicksCount || 0) - (a.clicksCount || 0)).slice(0, 6).map((p) => ({
      id: p.id,
      title: p.title,
      clicksCount: p.clicksCount || 0,
      category: p.category,
      imageUrl: p.imageUrl,
      price: p.price,
      platform: p.platform
    }));
    const platformMap = {};
    db.products.forEach((p) => {
      const plat = p.platform || "outros";
      platformMap[plat] = (platformMap[plat] || 0) + (p.clicksCount || 0);
    });
    const platformDistribution = Object.entries(platformMap).map(([platform, count]) => ({
      platform,
      count
    }));
    const categoryMap = {};
    db.products.forEach((p) => {
      const cat = p.category || "Outros";
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, clicks: 0 };
      categoryMap[cat].count += 1;
      categoryMap[cat].clicks += p.clicksCount || 0;
    });
    const categoryDistribution = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      count: data.count,
      clicks: data.clicks
    }));
    const dailyClicksMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      dailyClicksMap[dateStr] = 0;
    }
    db.clickLogs.forEach((log) => {
      if (log.timestamp) {
        const dateStr = log.timestamp.split("T")[0];
        if (dailyClicksMap[dateStr] !== void 0) {
          dailyClicksMap[dateStr] += 1;
        }
      }
    });
    const dailyClicks = Object.entries(dailyClicksMap).map(([date, clicks]) => ({
      date,
      clicks
    }));
    const metrics = {
      totalClicks,
      totalProducts,
      activeProducts,
      totalHighlights,
      topProducts,
      platformDistribution,
      categoryDistribution,
      recentClicks: db.clickLogs.slice(0, 15),
      dailyClicks
    };
    res.json(metrics);
  });
  apiRouter.post("/admin/reset-metrics", (req, res) => {
    db.products.forEach((p) => {
      p.clicksCount = 0;
    });
    db.clickLogs = [];
    saveDatabase(db);
    res.json({ message: "M\xE9tricas de cliques zeradas com sucesso!" });
  });
  apiRouter.post("/admin/seed", (req, res) => {
    db = {
      products: INITIAL_PRODUCTS,
      highlights: INITIAL_HIGHLIGHTS,
      categories: INITIAL_CATEGORIES,
      clickLogs: []
    };
    saveDatabase(db);
    res.json({ message: "Banco de dados restaurado para o cat\xE1logo inicial!" });
  });
  app.use("/api", apiRouter);
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.use((req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
