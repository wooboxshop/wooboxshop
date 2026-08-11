import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { INITIAL_PRODUCTS, INITIAL_HIGHLIGHTS, INITIAL_CATEGORIES } from "./src/data/initialData";
import { Product, Highlight, ClickLog, MetricSummary, PlatformType, CategoryOption } from "./src/types";

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

interface DatabaseSchema {
  products: Product[];
  highlights: Highlight[];
  categories: CategoryOption[];
  clickLogs: ClickLog[];
}

// Ensure data directory and db file exist
function initDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      highlights: INITIAL_HIGHLIGHTS,
      categories: INITIAL_CATEGORIES,
      clickLogs: [
        {
          id: 'log-1',
          productId: 'prod-1',
          productTitle: 'Luminária de Pôr do Sol Sunset Lamp RGB',
          platform: 'tiktok',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: 'log-2',
          productId: 'prod-5',
          productTitle: 'Kit Vlogger Microfone Sem Fio Lapela',
          platform: 'instagram',
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
      ],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (!parsed.categories || parsed.categories.length === 0) {
      parsed.categories = INITIAL_CATEGORIES;
    }
    return parsed;
  } catch (err) {
    console.error("Error reading database, recreating default:", err);
    const initialDb: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      highlights: INITIAL_HIGHLIGHTS,
      categories: INITIAL_CATEGORIES,
      clickLogs: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
    return initialDb;
  }
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database:", err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  let db = initDatabase();

  // API Routes
  const apiRouter = express.Router();

  // Admin secret verification
  apiRouter.post("/admin/verify", (req, res) => {
    const { code } = req.body;
    if (code === "wooboxadm99") {
      return res.json({ success: true, message: "Código administrativo verificado com sucesso!" });
    }
    return res.status(401).json({ success: false, message: "Código administrativo incorreto." });
  });

  // Get products with query filters
  apiRouter.get("/products", (req, res) => {
    const { search, category, minPrice, maxPrice, highlightId, platform, activeOnly } = req.query;

    let filtered = [...db.products];

    if (activeOnly === "true") {
      filtered = filtered.filter(p => p.isActive);
    }

    if (search && typeof search === "string") {
      const q = search.toLowerCase().trim();
      // Ignore if user typed the secret code directly in search
      if (q !== "wooboxadm99") {
        filtered = filtered.filter(
          p =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.badge && p.badge.toLowerCase().includes(q))
        );
      }
    }

    if (category && typeof category === "string" && category !== "todos") {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (highlightId && typeof highlightId === "string") {
      filtered = filtered.filter(p => p.highlightId === highlightId);
    }

    if (platform && typeof platform === "string" && platform !== "todas") {
      filtered = filtered.filter(p => p.platform === platform);
    }

    if (minPrice) {
      const min = parseFloat(minPrice as string);
      if (!isNaN(min)) filtered = filtered.filter(p => p.price >= min);
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice as string);
      if (!isNaN(max)) filtered = filtered.filter(p => p.price <= max);
    }

    res.json(filtered);
  });

  // Get single product
  apiRouter.get("/products/:id", (req, res) => {
    const product = db.products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ message: "Produto não encontrado" });
    res.json(product);
  });

  // Create product
  apiRouter.post("/products", (req, res) => {
    const newProduct: Product = {
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: req.body.title || "Novo Produto",
      description: req.body.description || "",
      price: parseFloat(req.body.price) || 0,
      originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : undefined,
      imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
      gallery: req.body.gallery || [],
      affiliateUrl: req.body.affiliateUrl || "https://shopee.com.br",
      category: req.body.category || "Achadinhos TikTok",
      platform: (req.body.platform as PlatformType) || "tiktok",
      badge: req.body.badge || "",
      highlightId: req.body.highlightId || undefined,
      isFeatured: Boolean(req.body.isFeatured),
      isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
      clicksCount: 0,
      rating: parseFloat(req.body.rating) || 5.0,
      reviewsCount: parseInt(req.body.reviewsCount) || 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.products.unshift(newProduct);
    saveDatabase(db);
    res.status(201).json(newProduct);
  });

  // Update product
  apiRouter.put("/products/:id", (req, res) => {
    const index = db.products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Produto não encontrado" });

    const existing = db.products[index];
    const updated: Product = {
      ...existing,
      ...req.body,
      price: req.body.price !== undefined ? parseFloat(req.body.price) : existing.price,
      originalPrice: req.body.originalPrice !== undefined ? (req.body.originalPrice ? parseFloat(req.body.originalPrice) : undefined) : existing.originalPrice,
      updatedAt: new Date().toISOString(),
    };

    db.products[index] = updated;
    saveDatabase(db);
    res.json(updated);
  });

  // Delete product
  apiRouter.delete("/products/:id", (req, res) => {
    const index = db.products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Produto não encontrado" });

    const deleted = db.products.splice(index, 1)[0];
    saveDatabase(db);
    res.json({ message: "Produto removido com sucesso", deleted });
  });

  // Track affiliate click
  apiRouter.post("/products/:id/click", (req, res) => {
    const product = db.products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ message: "Produto não encontrado" });

    product.clicksCount = (product.clicksCount || 0) + 1;

    const clickLog: ClickLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: product.id,
      productTitle: product.title,
      platform: product.platform,
      timestamp: new Date().toISOString(),
      referrer: req.body.referrer || "direct",
      userAgent: req.headers["user-agent"] || "",
    };

    db.clickLogs.unshift(clickLog);
    // Keep max 1000 logs
    if (db.clickLogs.length > 1000) {
      db.clickLogs = db.clickLogs.slice(0, 1000);
    }

    saveDatabase(db);
    res.json({ success: true, clicksCount: product.clicksCount, affiliateUrl: product.affiliateUrl });
  });

  // Highlights API
  apiRouter.get("/highlights", (req, res) => {
    res.json(db.highlights);
  });

  apiRouter.post("/highlights", (req, res) => {
    const newHighlight: Highlight = {
      id: req.body.id || `hl-${Date.now()}`,
      title: req.body.title || "Novo Destaque",
      subtitle: req.body.subtitle || "",
      badge: req.body.badge || "DESTAQUE",
      bannerUrl: req.body.bannerUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
      themeColor: req.body.themeColor || "from-pink-600 to-purple-600",
      iconName: req.body.iconName || "Gift",
      isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
      tagFilter: req.body.tagFilter || "",
    };

    db.highlights.push(newHighlight);
    saveDatabase(db);
    res.status(201).json(newHighlight);
  });

  apiRouter.put("/highlights/:id", (req, res) => {
    const index = db.highlights.findIndex(h => h.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Destaque não encontrado" });

    const updated = { ...db.highlights[index], ...req.body };
    db.highlights[index] = updated;
    saveDatabase(db);
    res.json(updated);
  });

  apiRouter.delete("/highlights/:id", (req, res) => {
    const index = db.highlights.findIndex(h => h.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Destaque não encontrado" });

    const deleted = db.highlights.splice(index, 1)[0];
    saveDatabase(db);
    res.json({ message: "Destaque removido com sucesso", deleted });
  });

  // Categories API
  apiRouter.get("/categories", (req, res) => {
    res.json(db.categories || INITIAL_CATEGORIES);
  });

  apiRouter.post("/categories", (req, res) => {
    const name = (req.body.name || "").trim();
    if (!name) return res.status(400).json({ message: "Nome da categoria é obrigatório" });

    const newCategory: CategoryOption = {
      id: req.body.id || `cat-${Date.now()}`,
      name,
      icon: req.body.icon || "Tag",
    };

    if (!db.categories) db.categories = [...INITIAL_CATEGORIES];
    db.categories.push(newCategory);
    saveDatabase(db);
    res.status(201).json(newCategory);
  });

  apiRouter.put("/categories/:id", (req, res) => {
    if (!db.categories) db.categories = [...INITIAL_CATEGORIES];
    const index = db.categories.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Categoria não encontrada" });

    const existing = db.categories[index];
    const updated: CategoryOption = {
      ...existing,
      name: req.body.name !== undefined ? req.body.name.trim() : existing.name,
      icon: req.body.icon !== undefined ? req.body.icon : existing.icon,
    };

    db.categories[index] = updated;
    saveDatabase(db);
    res.json(updated);
  });

  apiRouter.delete("/categories/:id", (req, res) => {
    if (!db.categories) db.categories = [...INITIAL_CATEGORIES];
    const index = db.categories.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Categoria não encontrada" });

    if (db.categories[index].id === "todos") {
      return res.status(400).json({ message: "Não é possível excluir a categoria padrão 'Todos'" });
    }

    const deleted = db.categories.splice(index, 1)[0];
    saveDatabase(db);
    res.json({ message: "Categoria removida com sucesso", deleted });
  });

  // 5. VALIDAÇÃO E NORMALIZAÇÃO DE PREÇO
  function parseAndNormalizePrice(val: any): number | null {
    if (val === null || val === undefined) return null;
    if (typeof val === 'number') {
      if (isNaN(val) || val <= 0) return null;
      if (val > 100000) return Math.round((val / 100000) * 100) / 100;
      return Math.round(val * 100) / 100;
    }

    const s = String(val).trim();
    if (!s) return null;

    // Converte formato BRL/Decimal para float (ex: "R$ 1.299,90" -> 1299.90, "59.90" -> 59.90, "59,90" -> 59.90)
    const matchWithCents = s.match(/(?:R\$\s*)?([\d]{1,3}(?:\.[\d]{3})*\,[\d]{1,2}|[\d]+[.,][\d]{1,2})/i);
    if (matchWithCents) {
      let clean = matchWithCents[1];
      if (clean.includes('.') && clean.includes(',')) {
        clean = clean.replace(/\./g, '').replace(',', '.');
      } else if (clean.includes(',')) {
        clean = clean.replace(',', '.');
      }
      const num = parseFloat(clean);
      if (!isNaN(num) && num >= 0.5 && num < 100000) {
        return Math.round(num * 100) / 100;
      }
    }

    // Inteiro sem centavos (ex: "1299", "59")
    const matchInteger = s.match(/(?:R\$\s*)?([\d]{1,3}(?:\.[\d]{3})+|[\d]{2,5})/i);
    if (matchInteger) {
      let clean = matchInteger[1].replace(/\./g, '');
      const num = parseFloat(clean);
      if (!isNaN(num) && num >= 0.5 && num < 100000) {
        return Math.round(num * 100) / 100;
      }
    }

    return null;
  }

  interface ExtractedPriceResult {
    currentPrice: number | null;
    oldPrice: number | null;
  }

  // 1. JSON-LD (PRIORIDADE MÁXIMA)
  function extractPriceFromJsonLD(html: string): ExtractedPriceResult {
    let currentPrice: number | null = null;
    let oldPrice: number | null = null;

    const ldJsonScripts = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
    for (const scriptTag of ldJsonScripts) {
      try {
        const jsonText = scriptTag[1].trim();
        const ld = JSON.parse(jsonText);

        const items = Array.isArray(ld) ? ld : [ld];
        for (const item of items) {
          const type = item['@type'];
          const isProduct = type === 'Product' || (Array.isArray(type) && type.includes('Product'));
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
          } else if (isProduct && item.price !== undefined) {
            const p = parseAndNormalizePrice(item.price);
            if (p && (!currentPrice || p < currentPrice)) {
              currentPrice = p;
            }
          }
        }
      } catch (e) {
        // ignore JSON parse error
      }
    }

    return { currentPrice, oldPrice };
  }

  // 2. META TAGS (PRIORIDADE 2)
  function extractPriceFromMeta(html: string): ExtractedPriceResult {
    let currentPrice: number | null = null;
    let oldPrice: number | null = null;

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

  // 3. JSON EMBUTIDO NA PÁGINA (PRIORIDADE 3)
  function extractPriceFromEmbeddedJson(html: string): ExtractedPriceResult {
    let currentPrice: number | null = null;
    let oldPrice: number | null = null;

    const stateMatches = [
      ...html.matchAll(/window\.__PRELOADED_STATE__\s*=\s*(\{[\s\S]*?\});/gi),
      ...html.matchAll(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/gi),
      ...html.matchAll(/<script[^>]*>[\s\S]*?var\s+(?:initialState|__PRELOADED_STATE__|pageData)\s*=\s*(\{[\s\S]*?\});<\/script>/gi)
    ];

    for (const sm of stateMatches) {
      try {
        const rawJson = sm[1];

        // Preço atual
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

        // Preço anterior / original
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
        // ignore json parse error
      }
    }

    return { currentPrice, oldPrice };
  }

  // 4. HTML VISÍVEL (ÚLTIMO RECURSO)
  function extractPriceFromVisibleHtml(html: string): ExtractedPriceResult {
    let currentPrice: number | null = null;
    let oldPrice: number | null = null;

    // Isola o container principal do produto para não capturar recomendados ou parcelamentos
    const mainPdpBlock = html.match(/class=["'][^"']*(?:ui-pdp-price|ui-pdp-main|ui-pdp-container)[^"']*["'][\s\S]{1,3000}?<\/div>\s*<\/div>/i) ||
                          html.match(/id=["']priceblock_(?:dealprice|ourprice)["'][^>]*>[\s\S]{1,500}/i) ||
                          html.match(/class=["'][^"']*a-price\s+a-text-price\s+a-size-medium[^"']*["'][\s\S]{1,500}/i);

    const containerText = mainPdpBlock ? mainPdpBlock[0] : html;

    // Preço anterior riscado
    const oldPriceBlock = containerText.match(/class=["'][^"']*(?:ui-pdp-price__original-value|andes-money-amount--previous|ui-pdp-price__part--medium\s+s)[^"']*["'][\s\S]{1,500}/i) ||
                          containerText.match(/<s[\s\S]{1,500}?<\/s>/i);

    if (oldPriceBlock) {
      const oldStr = oldPriceBlock[0];
      const frac = oldStr.match(/andes-money-amount__fraction["'][^>]*>([\d.]+)</i) || oldStr.match(/price-tag-fraction["'][^>]*>([\d.]+)</i);
      if (frac) {
        const cleanFrac = frac[1].replace(/\./g, '');
        const centsMatch = oldStr.match(/andes-money-amount__cents["'][^>]*>([\d]+)</i) || oldStr.match(/price-tag-cents["'][^>]*>([\d]+)</i);
        const cents = centsMatch ? centsMatch[1] : '00';
        oldPrice = parseAndNormalizePrice(`${cleanFrac}.${cents}`);
      }
    }

    // Preço atual principal
    const mainPriceMatch = containerText.match(/class=["'][^"']*(?:ui-pdp-price__second-line|andes-money-amount--main|ui-pdp-price__part--large)[^"']*["'][\s\S]{1,1500}/i);
    const mainStr = mainPriceMatch ? mainPriceMatch[0] : containerText;

    const frac = mainStr.match(/andes-money-amount__fraction["'][^>]*>([\d.]+)</i) || mainStr.match(/price-tag-fraction["'][^>]*>([\d.]+)</i);
    if (frac) {
      const cleanFrac = frac[1].replace(/\./g, '');
      const centsMatch = mainStr.match(/andes-money-amount__cents["'][^>]*>([\d]+)</i) || mainStr.match(/price-tag-cents["'][^>]*>([\d]+)</i);
      const cents = centsMatch ? centsMatch[1] : '00';
      currentPrice = parseAndNormalizePrice(`${cleanFrac}.${cents}`);
    }

    if (!currentPrice) {
      const dePorMatch = containerText.match(/de\s+R\$\s*([\d.,]+)\s+por\s+R\$\s*([\d.,]+)/i);
      if (dePorMatch) {
        oldPrice = parseAndNormalizePrice(dePorMatch[1]);
        currentPrice = parseAndNormalizePrice(dePorMatch[2]);
      }
    }

    return { currentPrice, oldPrice };
  }

  function parseBrlPriceValue(str: string | number | undefined | null): number | null {
    return parseAndNormalizePrice(str);
  }

  function cleanHtmlText(str: string): string {
    if (!str) return "";
    return str
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Gemini AI Client initialization for AI-powered copywriting
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  function generateSmartDescription(title: string, platform: string, rawDesc?: string): string {
    const cleanDesc = (rawDesc || "").trim();
    const lowerDesc = cleanDesc.toLowerCase();

    const isGenericOrBad = !cleanDesc ||
      cleanDesc.length < 25 ||
      lowerDesc.includes("wooboxshop") ||
      lowerDesc.includes("visite a página") ||
      lowerDesc.includes("encontre todos os produtos") ||
      lowerDesc.includes("compre no mercado livre") ||
      lowerDesc.includes("confira os produtos") ||
      lowerDesc.includes("loja oficial no mercado livre") ||
      lowerDesc.includes("compre com frete grátis no mercado livre");

    if (!isGenericOrBad) {
      return cleanDesc;
    }

    const cleanTitle = title
      ? title.replace(/^(Achadinho|Produto|Oferta|Destaque)[^:-]*[:-]\s*/i, '').trim()
      : "Produto Selecionado";

    if (platform === "mercadolivre") {
      return `⚡ ${cleanTitle} — Oferta oficial imperdível com garantia, alta avaliação e entrega super rápida! Aproveite o desconto por tempo limitado.`;
    } else if (platform === "shopee") {
      return `🔥 ${cleanTitle} — O achadinho campeão de vendas com excelente custo-benefício e avaliação 5 estrelas dos compradores.`;
    } else if (platform === "amazon") {
      return `📦 ${cleanTitle} — Item de alta qualidade com selo Amazon Prime, garantia de procedência e envio expresso.`;
    } else {
      return `✨ ${cleanTitle} — Lançamento exclusivo com garantia e entrega rápida pela loja oficial. Garanta o seu com desconto especial!`;
    }
  }

  async function generateCommercialDescriptionWithGemini(
    title: string,
    platform: string,
    price: number,
    originalPrice?: number | null,
    rawDesc?: string
  ): Promise<string> {
    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `Você é um especialista em copywriting para e-commerce e criador de conteúdo de achadinhos virais (Instagram, TikTok e WhatsApp).
Crie uma descrição comercial incrivelmente atraente, persuasiva e criativa em Português do Brasil para o seguinte produto:

Título do Produto: "${title}"
Plataforma: ${platform}
Preço de Oferta Atual: R$ ${price.toFixed(2).replace('.', ',')}
${originalPrice ? `Preço Original (De): R$ ${originalPrice.toFixed(2).replace('.', ',')}` : ''}
Detalhes Adicionais da Página: "${rawDesc || 'Nenhum'}"

Diretrizes Obrigatórias:
1. Escreva uma descrição altamente persuasiva focando em utilidade, benefícios e custo-benefício do produto.
2. Inclua de 3 a 5 emojis adequados e chamativos.
3. Mantenha o texto objetivo, fluido e fácil de ler nas redes sociais (entre 30 e 70 palavras).
4. NÃO inclua saudações, introduções ("Aqui está a descrição:") ou aspas ao redor.
5. NÃO coloque frases genéricas como "visite a página", "confira os produtos" ou "veja no site".
6. Retorne APENAS a descrição pronta para publicação.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
        });

        const text = response.text?.trim();
        if (text && text.length > 25) {
          return text.replace(/^["']|["']$/g, '').trim();
        }
      } catch (err) {
        console.error("Erro ao gerar descrição no Gemini:", err);
      }
    }

    return generateSmartDescription(title, platform, rawDesc);
  }

  // Smart Autofill Link Parser Endpoint
  apiRouter.post("/autofill", async (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL inválida" });
    }

    const lowerUrl = url.toLowerCase();
    let platform: PlatformType = "outros";
    let badge = "✨ Oferta Selecionada";

    if (lowerUrl.includes("shopee") || lowerUrl.includes("shope.ee")) {
      platform = "shopee";
      badge = "🔥 Achadinho Shopee";
    } else if (lowerUrl.includes("amazon") || lowerUrl.includes("amzn.to") || lowerUrl.includes("a.co")) {
      platform = "amazon";
      badge = "⚡ Oferta Prime Amazon";
    } else if (lowerUrl.includes("mercadolivre") || lowerUrl.includes("mercado.livre") || lowerUrl.includes("meli.la") || lowerUrl.includes("mlb")) {
      platform = "mercadolivre";
      badge = "📦 Entrega Rápida ML";
    } else if (lowerUrl.includes("tiktok") || lowerUrl.includes("vt.tiktok")) {
      platform = "tiktok";
      badge = "🔥 Viral no TikTok";
    } else if (lowerUrl.includes("aliexpress") || lowerUrl.includes("s.click.aliexpress")) {
      platform = "aliexpress";
      badge = "🌐 Importado Choice";
    } else if (lowerUrl.includes("instagram") || lowerUrl.includes("instagr.am")) {
      platform = "instagram";
      badge = "📸 Destaque Instagram";
    }

    let extractedTitle = "";
    let extractedImage = "";
    let extractedDescription = "";
    let extractedPrice: number | null = null;
    let extractedOriginalPrice: number | null = null;
    const candidatePrices: number[] = [];

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(5500),
      });

      if (response.ok) {
        const html = await response.text();

        // 1. Title
        const ogTitleMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:title|twitter:title|title)["']\s+content=["']([^"']+)["']/i) ||
                             html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:title|twitter:title|title)["']/i) ||
                             html.match(/<title>([^<]+)<\/title>/i);
        if (ogTitleMatch) extractedTitle = cleanHtmlText(ogTitleMatch[1]);

        if (extractedTitle) {
          extractedTitle = extractedTitle
            .replace(/\s*\|\s*MercadoLivre\.com\.br$/i, '')
            .replace(/\s*\|\s*Mercado\s*Livre$/i, '')
            .replace(/\s*-\s*Mercado\s*Livre$/i, '')
            .replace(/\s*\|\s*Shopee\s*Brasil$/i, '')
            .replace(/\s*:\s*Amazon\.com\.br.*$/i, '')
            .trim();
        }

        // 2. Image
        const ogImageMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:image|twitter:image|image)["']\s+content=["']([^"']+)["']/i) ||
                             html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:image|twitter:image|image)["']/i);
        if (ogImageMatch) extractedImage = ogImageMatch[1];

        // 3. Description
        const ogDescMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:description|twitter:description|description)["']\s+content=["']([^"']+)["']/i) ||
                            html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:description|twitter:description|description)["']/i);
        if (ogDescMatch) extractedDescription = cleanHtmlText(ogDescMatch[1]);

    // 4. MULTI-LAYERED FALLBACK PRICE EXTRACTION PIPELINE
    // Order: JSON-LD (1) -> META TAGS (2) -> EMBEDDED JSON (3) -> VISIBLE HTML (4)
    const extractors = [
      extractPriceFromJsonLD,
      extractPriceFromMeta,
      extractPriceFromEmbeddedJson,
      extractPriceFromVisibleHtml
    ];

    for (const extractor of extractors) {
      const result = extractor(html);
      if (result.currentPrice !== null && result.currentPrice !== undefined && result.currentPrice > 0) {
        extractedPrice = result.currentPrice;
        if (result.oldPrice && result.oldPrice > result.currentPrice) {
          extractedOriginalPrice = result.oldPrice;
        }
        break; // O primeiro método que retornar um preço válido encerra a busca
      }
    }

    // Caso o extrator vencedor não tenha retornado o preço original, busca um oldPrice maior
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

    // O preço capturado da página vai para o Preço Original
    const capturedPagePrice = extractedPrice || extractedOriginalPrice || null;

    let title = extractedTitle.trim();
    let imageUrl = extractedImage.trim();

    let price = 0; // Preço Atual NÃO é capturado automaticamente (será inserido manualmente pelo usuário)
    let originalPrice: number | null = null;
    let category = "Tendências & Destaques";

    if (capturedPagePrice) {
      originalPrice = Math.round(capturedPagePrice * 100) / 100;
    } else {
      if (platform === "mercadolivre") {
        category = "Tech & Gadgets";
        originalPrice = 119.90;
      } else if (platform === "shopee") {
        category = "Casa & Setup";
        originalPrice = 69.90;
      } else if (platform === "amazon") {
        category = "Tech & Gadgets";
        originalPrice = 220.00;
      } else {
        originalPrice = 89.90;
      }
    }

    if (!title) {
      if (platform === "mercadolivre") title = "Achadinho Oficial Mercado Livre - Envio Rápido";
      else if (platform === "shopee") title = "Achadinho Shopee Viral do TikTok";
      else if (platform === "amazon") title = "Produto Selecionado Amazon Prime";
      else title = "Produto Destaque Selecionado";
    }

    // Preço de referência para a IA Gemini gerar a descrição
    const aiRefPrice = originalPrice || 99.90;

    // Generate high-converting creative description with Gemini AI
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
      price: 0, // Preço Atual zerado para preenchimento manual pelo usuário
      originalPrice, // Preço capturado do anúncio vai para o Preço Original
      category,
      platform,
      badge,
      imageUrl,
      affiliateUrl: url,
    });
  });

  // Analytics Metrics API
  apiRouter.get("/metrics", (req, res) => {
    const totalClicks = db.products.reduce((acc, p) => acc + (p.clicksCount || 0), 0);
    const totalProducts = db.products.length;
    const activeProducts = db.products.filter(p => p.isActive).length;
    const totalHighlights = db.highlights.length;

    // Top products by clicks
    const topProducts = [...db.products]
      .sort((a, b) => (b.clicksCount || 0) - (a.clicksCount || 0))
      .slice(0, 6)
      .map(p => ({
        id: p.id,
        title: p.title,
        clicksCount: p.clicksCount || 0,
        category: p.category,
        imageUrl: p.imageUrl,
        price: p.price,
        platform: p.platform,
      }));

    // Clicks by platform
    const platformMap: Record<string, number> = {};
    db.products.forEach(p => {
      const plat = p.platform || "outros";
      platformMap[plat] = (platformMap[plat] || 0) + (p.clicksCount || 0);
    });

    const platformDistribution = Object.entries(platformMap).map(([platform, count]) => ({
      platform,
      count,
    }));

    // Clicks by category
    const categoryMap: Record<string, { count: number; clicks: number }> = {};
    db.products.forEach(p => {
      const cat = p.category || "Outros";
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, clicks: 0 };
      categoryMap[cat].count += 1;
      categoryMap[cat].clicks += p.clicksCount || 0;
    });

    const categoryDistribution = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      count: data.count,
      clicks: data.clicks,
    }));

    // Daily clicks past 7 days
    const dailyClicksMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      dailyClicksMap[dateStr] = 0;
    }

    db.clickLogs.forEach(log => {
      if (log.timestamp) {
        const dateStr = log.timestamp.split("T")[0];
        if (dailyClicksMap[dateStr] !== undefined) {
          dailyClicksMap[dateStr] += 1;
        }
      }
    });

    const dailyClicks = Object.entries(dailyClicksMap).map(([date, clicks]) => ({
      date,
      clicks,
    }));

    const metrics: MetricSummary = {
      totalClicks,
      totalProducts,
      activeProducts,
      totalHighlights,
      topProducts,
      platformDistribution,
      categoryDistribution,
      recentClicks: db.clickLogs.slice(0, 15),
      dailyClicks,
    };

    res.json(metrics);
  });

  // Admin Reset Metrics
  apiRouter.post("/admin/reset-metrics", (req, res) => {
    db.products.forEach(p => {
      p.clicksCount = 0;
    });
    db.clickLogs = [];
    saveDatabase(db);
    res.json({ message: "Métricas de cliques zeradas com sucesso!" });
  });

  // Admin Reset Seed
  apiRouter.post("/admin/seed", (req, res) => {
    db = {
      products: INITIAL_PRODUCTS,
      highlights: INITIAL_HIGHLIGHTS,
      categories: INITIAL_CATEGORIES,
      clickLogs: [],
    };
    saveDatabase(db);
    res.json({ message: "Banco de dados restaurado para o catálogo inicial!" });
  });

  app.use("/api", apiRouter);

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
