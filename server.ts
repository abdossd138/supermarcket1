import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEED_CATEGORIES, SEED_PRODUCTS } from './catalogSeed.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Initial seed data
const CATALOG_VERSION = 4;
const initialData = {
  catalogVersion: CATALOG_VERSION,
  settings: {
    storeName: "الماركت المصري",
    storeSubtitle: "سوبر ماركت العائلة المصرية - أكثر من 1150 منتج مصري وأصلي بتوصيل سريع",
    brandBadge: "أصلي 100%",
    logoMode: "icon",
    logoIcon: "ShoppingBag",
    logoShape: "rounded",
    logoUrl: "",
    siteStyle: "emerald-classic",
    cardStyle: "rounded",
    heroStyle: "split",
    fontFamily: "Cairo",
    gridColumns: 4,
    showHero: true,
    showAnnouncement: true,
    showFloatingWhatsapp: true,
    showEgyptianBadge: true,
    heroBadge: "أكبر تشكيلة سوبر ماركت في مصر 🇪🇬",
    heroTitle: "كل احتياجات بيتك لباب الشقة بأفضل سعر في مصر",
    heroSubtitle: "تشكيلة ضخمة من المكرونات بأنواعها، الألبان والجبن، الشيبسيهات والسناكس، الحاجات الساقعة والمشروبات، البقالة، الخضار والفاكهة والمنظفات بتوصيل سريع لباب البيت.",
    heroImage: "/src/assets/images/hero_supermarket_1795012899092.jpg",
    phone: "01012345678",
    whatsappNumber: "201012345678",
    deliveryFee: 25,
    freeDeliveryThreshold: 300,
    minOrderAmount: 150,
    currencyLabel: "ج.م",
    footerAbout: "سوبر ماركت العائلة المصرية الرائد. نوفر أجود المنتجات المحلية والبدائل المصرية بأسعار تنافسية مع خدمة توصيل سريعة لكافة المحافظات.",
    copyrightText: "الماركت المصري (Al-Market Al-Masry). جميع الحقوق محفوظة.",
    announcement: "🎉 عروض الماركت المصري الكبرى: سوبر ماركت متكامل يضم أكثر من 1150 صنف من المكرونات، الجبن، الشيبسي، والمشروبات بتوصيل سريع!",
  },
  categories: SEED_CATEGORIES,
  products: SEED_PRODUCTS,
  orders: [
    {
      id: "ORD-9821",
      customerName: "أحمد محمد علي",
      phone: "01098765432",
      address: {
        governorate: "القاهرة",
        city: "مدينة نصر",
        street: "شارع عباس العقاد، عمارة 14",
        building: "14",
        floor: "الثالث",
        apartment: "32",
        landmark: "بجوار جاد للرستورانت"
      },
      items: [
        { productId: "p_6222002300474", nameArabic: "شاي بريتش أسود العروسة - 25 فتلة", price: 58, quantity: 2 },
        { productId: "p_6223000752937", nameArabic: "جبنة بيضاء دومتي - 450جم", price: 45, quantity: 3 }
      ],
      subtotal: 251,
      deliveryFee: 25,
      total: 276,
      paymentMethod: "Cash on Delivery",
      status: "جاري التجهيز (Processing)",
      timeSlot: "اليوم - الفترة المسائية (6 م - 9 م)",
      createdAt: new Date().toISOString()
    }
  ],
  customers: [
    {
      id: "cust-1",
      name: "أحمد محمد علي",
      phone: "01098765432",
      email: "ahmed@example.com",
      governorate: "القاهرة",
      totalOrders: 5,
      totalSpent: 1850
    },
    {
      id: "cust-2",
      name: "فاطمة الزهراء إبراهيم",
      phone: "01123456789",
      email: "fatma@example.com",
      governorate: "الجيزة",
      totalOrders: 3,
      totalSpent: 1200
    }
  ]
};

// Ensure data dir exists and store.json exists / upgrades to full catalog
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(STORE_FILE)) {
  fs.writeFileSync(STORE_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
} else {
  try {
    const existing = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
    if (!existing.products || existing.products.length < 100 || (existing.catalogVersion || 1) < CATALOG_VERSION) {
      const upgraded = {
        ...existing,
        catalogVersion: CATALOG_VERSION,
        settings: {
          ...initialData.settings,
          ...(existing.settings || {}),
          storeSubtitle: initialData.settings.storeSubtitle,
          announcement: initialData.settings.announcement,
        },
        categories: SEED_CATEGORIES,
        products: SEED_PRODUCTS,
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(upgraded, null, 2), 'utf-8');
    }
  } catch {
    fs.writeFileSync(STORE_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

const readStore = () => {
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return initialData;
  }
};

const writeStore = (data: any) => {
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// API Routes
app.get('/api/store', (req, res) => {
  res.json(readStore());
});

// Settings
app.put('/api/settings', (req, res) => {
  const store = readStore();
  store.settings = { ...store.settings, ...req.body };
  writeStore(store);
  res.json(store.settings);
});

// Categories CRUD
app.post('/api/categories', (req, res) => {
  const store = readStore();
  const newCat = { id: 'c_' + Date.now(), ...req.body };
  store.categories.push(newCat);
  writeStore(store);
  res.status(201).json(newCat);
});

app.put('/api/categories/:id', (req, res) => {
  const store = readStore();
  const idx = store.categories.findIndex((c: any) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Category not found' });
  store.categories[idx] = { ...store.categories[idx], ...req.body };
  writeStore(store);
  res.json(store.categories[idx]);
});

app.delete('/api/categories/:id', (req, res) => {
  const store = readStore();
  store.categories = store.categories.filter((c: any) => c.id !== req.params.id);
  writeStore(store);
  res.json({ success: true });
});

// Products CRUD
app.post('/api/products', (req, res) => {
  const store = readStore();
  const newProd = { id: 'p_' + Date.now(), ...req.body };
  store.products.push(newProd);
  writeStore(store);
  res.status(201).json(newProd);
});

app.put('/api/products/:id', (req, res) => {
  const store = readStore();
  const idx = store.products.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  store.products[idx] = { ...store.products[idx], ...req.body };
  writeStore(store);
  res.json(store.products[idx]);
});

app.delete('/api/products/:id', (req, res) => {
  const store = readStore();
  store.products = store.products.filter((p: any) => p.id !== req.params.id);
  writeStore(store);
  res.json({ success: true });
});

// Orders CRUD & status update
app.post('/api/orders', (req, res) => {
  const { customerName, phone, items } = req.body || {};
  if (!customerName?.trim() || !phone?.trim() || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'بيانات الطلب غير مكتملة' });
  }

  const store = readStore();
  const newOrder = {
    id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    createdAt: new Date().toISOString(),
    status: 'جديد (New)',
    ...req.body
  };
  store.orders.unshift(newOrder);

  // Update product stock safely
  for (const item of items) {
    const prod = store.products.find((p: any) => p.id === item.productId);
    if (prod && typeof prod.stock === 'number') {
      prod.stock = Math.max(0, prod.stock - Number(item.quantity || 1));
    }
  }

  // Update or add customer
  const custPhone = newOrder.phone;
  let customer = store.customers.find((c: any) => c.phone === custPhone);
  if (customer) {
    customer.totalOrders += 1;
    customer.totalSpent += newOrder.total;
  } else {
    store.customers.push({
      id: 'cust_' + Date.now(),
      name: newOrder.customerName,
      phone: custPhone,
      email: newOrder.email || 'customer@market.eg',
      governorate: newOrder.address?.governorate || 'القاهرة',
      totalOrders: 1,
      totalSpent: newOrder.total
    });
  }

  writeStore(store);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id/status', (req, res) => {
  const store = readStore();
  const order = store.orders.find((o: any) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = req.body.status;
  writeStore(store);
  res.json(order);
});

// Serve product & store images directly with browser caching for instant display
const imagesDir = path.join(__dirname, 'src/assets/images');
if (fs.existsSync(imagesDir)) {
  app.use(
    '/src/assets/images',
    express.static(imagesDir, {
      maxAge: '7d',
      immutable: true,
      etag: true,
    })
  );
}

// Vite middleware in development
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(
    '/src/assets/images',
    express.static(path.join(distPath, 'src/assets/images'), {
      maxAge: '7d',
      immutable: true,
      etag: true,
    })
  );
  app.use(express.static(distPath, { maxAge: '1h' }));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`الماركت المصري running on http://localhost:${PORT}`);
});
