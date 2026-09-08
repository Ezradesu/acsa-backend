import { writeFileSync } from 'node:fs';

const groups = {
  'Pemeriksaan aplikasi': [
    ['Root API', 'GET', ''],
    ['Healthcheck', 'GET', 'health'],
  ],
  'Autentikasi dan pengguna': [
    ['Register', 'POST', 'auth/register', 'public', 'register'],
    ['Login', 'POST', 'auth/login', 'public', 'login'],
    ['Verifikasi email', 'GET', 'auth/verify-email?token={{verificationToken}}'],
    ['Kirim ulang verifikasi', 'POST', 'auth/resend-verification', 'public', 'resend'],
    ['Profil saya', 'GET', 'auth/me', 'login'],
    ['Daftar pengguna', 'GET', 'auth/users', 'admin'],
    ['Ubah profil', 'PUT', 'users/{{userId}}', 'login', 'user'],
    ['Hapus pengguna', 'DELETE', 'users/{{userId}}', 'admin'],
  ],
  Produk: [
    ['Daftar produk', 'GET', 'products?page=1&limit=10&search='],
    ['Detail produk', 'GET', 'products/{{productId}}'],
    ['Buat produk', 'POST', 'products', 'admin', 'product'],
    ['Ubah produk', 'PUT', 'products/{{productId}}', 'admin', 'productUpdate'],
    ['Soft delete produk', 'DELETE', 'products/{{productId}}', 'admin'],
    ['Unggah gambar produk', 'POST', 'products/{{productId}}/images', 'admin', 'files'],
    ['Hapus gambar produk', 'DELETE', 'products/{{productId}}/images/{{imageId}}', 'admin'],
  ],
  Brand: [
    ['Daftar brand', 'GET', 'brands?page=1&limit=10'],
    ['Detail brand', 'GET', 'brands/{{brandId}}'],
    ['Buat brand', 'POST', 'brands', 'admin', 'brand'],
    ['Ubah brand', 'PUT', 'brands/{{brandId}}', 'admin', 'brand'],
    ['Hapus brand', 'DELETE', 'brands/{{brandId}}', 'admin'],
    ['Unggah logo brand', 'POST', 'brands/{{brandId}}/image', 'admin', 'file'],
  ],
  Kategori: [
    ['Daftar kategori', 'GET', 'categories?page=1&limit=10'],
    ['Detail kategori', 'GET', 'categories/{{categoryId}}'],
    ['Buat kategori', 'POST', 'categories', 'admin', 'category'],
    ['Ubah kategori', 'PUT', 'categories/{{categoryId}}', 'admin', 'category'],
    ['Hapus kategori', 'DELETE', 'categories/{{categoryId}}', 'admin'],
  ],
  'Tipe AC': [
    ['Daftar tipe AC', 'GET', 'ac-types?page=1&limit=10'],
    ['Detail tipe AC', 'GET', 'ac-types/{{acTypeId}}'],
    ['Buat tipe AC', 'POST', 'ac-types', 'admin', 'acType'],
    ['Ubah tipe AC', 'PATCH', 'ac-types/{{acTypeId}}', 'admin', 'acType'],
    ['Hapus tipe AC', 'DELETE', 'ac-types/{{acTypeId}}', 'admin'],
  ],
  Keranjang: [
    ['Keranjang saya', 'GET', 'cart', 'login'],
    ['Tambah item', 'POST', 'cart/items', 'login', 'cartItem'],
    ['Ubah jumlah item', 'PUT', 'cart/items/{{cartItemId}}', 'login', 'quantity'],
    ['Hapus item', 'DELETE', 'cart/items/{{cartItemId}}', 'login'],
    ['Kosongkan keranjang', 'DELETE', 'cart/clear', 'login'],
  ],
  Wishlist: [
    ['Wishlist saya', 'GET', 'wishlist', 'login'],
    ['Tambah item', 'POST', 'wishlist/items', 'login', 'wishlistItem'],
    ['Hapus item', 'DELETE', 'wishlist/items/{{wishlistItemId}}', 'login'],
  ],
  'Pesanan dan Midtrans': [
    ['Daftar pesanan', 'GET', 'orders', 'login'],
    ['Detail pesanan', 'GET', 'orders/{{orderId}}', 'login'],
    ['Buat pesanan', 'POST', 'orders', 'login', 'order'],
    ['Ubah status pesanan', 'PUT', 'orders/{{orderId}}/status', 'admin', 'orderStatus'],
    ['Batalkan pesanan', 'DELETE', 'orders/{{orderId}}/cancel', 'login'],
    ['Webhook pembayaran', 'POST', 'orders/payment/webhook', 'signature', 'webhook'],
  ],
  Review: [
    ['Daftar review produk', 'GET', 'products/{{productId}}/reviews'],
    ['Buat review', 'POST', 'products/{{productId}}/reviews', 'login', 'review'],
    ['Ubah review', 'PUT', 'products/{{productId}}/reviews/{{reviewId}}', 'login', 'review'],
    ['Hapus review', 'DELETE', 'products/{{productId}}/reviews/{{reviewId}}', 'login'],
  ],
  Diskon: resource('discounts', 'discountId', 'diskon', 'discount', true),
  'Produk pilihan': resource('featured-products', 'featuredProductId', 'produk pilihan', 'featured', true),
  'Brand sponsor': resource('sponsored-brands', 'sponsoredBrandId', 'brand sponsor', 'sponsored', true),
  Banner: [
    ...resource('banners', 'bannerId', 'banner', 'banner', true),
    ['Unggah gambar banner', 'POST', 'banners/{{bannerId}}/image', 'admin', 'file'],
  ],
  Proyek: [
    ...resource('projects', 'projectId', 'proyek', 'project'),
    ['Unggah gambar proyek', 'POST', 'projects/{{projectId}}/images', 'admin', 'files'],
    ['Hapus gambar proyek', 'DELETE', 'projects/{{projectId}}/images/{{imageId}}', 'admin'],
  ],
  Artikel: [
    ...resource('articles', 'articleId', 'artikel', 'article'),
    ['Unggah gambar artikel', 'POST', 'articles/{{articleId}}/images', 'admin', 'files'],
    ['Hapus gambar artikel', 'DELETE', 'articles/{{articleId}}/images/{{imageId}}', 'admin'],
  ],
  Perusahaan: [
    ['Profil perusahaan', 'GET', 'company'],
    ['Ubah profil perusahaan', 'PUT', 'company', 'admin', 'company'],
    ['Unggah logo perusahaan', 'POST', 'company/logo', 'admin', 'file'],
  ],
  'Media sosial': resource('social-media', 'socialMediaId', 'media sosial', 'social'),
  Staf: [
    ...resource('staff', 'staffId', 'staf', 'staff'),
    ['Unggah foto staf', 'POST', 'staff/{{staffId}}/image', 'admin', 'file'],
  ],
};

function resource(path, idVariable, label, bodyKey, hasActive = false) {
  const entries = [
    [`Daftar ${label}`, 'GET', path],
    [`Detail ${label}`, 'GET', `${path}/{{${idVariable}}}`],
    [`Buat ${label}`, 'POST', path, 'admin', bodyKey],
    [
      `Ubah ${label}`,
      'PUT',
      `${path}/{{${idVariable}}}`,
      'admin',
      ['discount', 'featured', 'sponsored'].includes(bodyKey)
        ? `${bodyKey}Update`
        : bodyKey,
    ],
    [`Hapus ${label}`, 'DELETE', `${path}/{{${idVariable}}}`, 'admin'],
  ];
  if (hasActive) entries.splice(1, 0, [`${label} aktif`, 'GET', `${path}/active`]);
  return entries;
}

const bodies = {
  register: { email: 'user.uji@acsa.example', password: 'PasswordUji123!', first_name: 'Nando', last_name: 'Tester' },
  login: { email: 'user.uji@acsa.example', password: 'PasswordUji123!' },
  resend: { email: 'user.uji@acsa.example' },
  user: { first_name: 'Nando', last_name: 'Tester', address: 'Alamat data uji' },
  product: { id_brand: 1, id_category: 1, id_ac_type: 1, name: 'Produk Uji', description: 'Hapus setelah pengujian', price: 1000000, quantity: 5, freon_type: 'R32', model_code: 'TEST-01', series_name: 'Uji' },
  productUpdate: { name: 'Produk Uji Diperbarui', price: 1100000, quantity: 4 },
  brand: { name: 'Brand Uji' },
  category: { name: 'Kategori Uji' },
  acType: { name: 'Tipe AC Uji' },
  cartItem: { id_product: '{{productId}}', quantity: 1 },
  quantity: { quantity: 2 },
  wishlistItem: { id_product: '{{productId}}' },
  order: { items: [{ id_product: '{{productId}}', quantity: 1 }] },
  orderStatus: { status: 'processing' },
  webhook: { order_id: '{{orderId}}', status_code: '200', gross_amount: '1000000.00', transaction_status: 'settlement', fraud_status: 'accept', signature_key: 'ISI_SIGNATURE_SANDBOX_YANG_SAH' },
  review: { rating: 5, comment: 'Review data uji' },
  discount: { id_product: '{{productId}}', price: 900000, start_date: '2026-09-09T00:00:00.000Z', end_date: '2026-09-30T23:59:59.000Z' },
  featured: { id_product: '{{productId}}', priority: 1, start_date: '2026-09-09T00:00:00.000Z', end_date: '2026-09-30T23:59:59.000Z' },
  sponsored: { id_brand: 1, priority: 1, start_date: '2026-09-09T00:00:00.000Z', end_date: '2026-09-30T23:59:59.000Z' },
  banner: { id_brand: 1, name: 'Banner Uji', category: 'home', start_date: '2026-09-09T00:00:00.000Z', end_date: '2026-09-30T23:59:59.000Z' },
  discountUpdate: { price: 850000, end_date: '2026-10-31T23:59:59.000Z' },
  featuredUpdate: { priority: 2, end_date: '2026-10-31T23:59:59.000Z' },
  sponsoredUpdate: { priority: 2, end_date: '2026-10-31T23:59:59.000Z' },
  project: { name: 'Proyek Uji', description: 'Hapus setelah pengujian', location: 'Lokasi uji', id_products: ['{{productId}}'] },
  article: { name: 'Artikel Uji', description: 'Hapus setelah pengujian', category: 'Uji' },
  company: { name: 'ACSA', description: 'Data uji', email: 'info@acsa.example', phone: '0000000000' },
  social: { name: 'Instagram', icon: 'instagram', url: 'https://example.com/acsa' },
  staff: { name: 'Staf Uji', role: 'Teknisi' },
};

function makeRequest([name, method, path, access = 'public', bodyKey]) {
  const request = {
    method,
    header: [],
    url: `{{baseUrl}}${path ? `/${path}` : ''}`,
    description: `Akses: ${access}. Data pada request ini adalah data uji dan perlu disesuaikan dengan lingkungan ACSA.`,
  };

  if (access === 'login' || access === 'admin') {
    request.auth = { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] };
  } else {
    request.auth = { type: 'noauth' };
  }

  if (bodyKey === 'file' || bodyKey === 'files') {
    request.body = {
      mode: 'formdata',
      formdata: [{ key: bodyKey, type: 'file', src: [] }],
    };
  } else if (bodyKey) {
    request.header.push({ key: 'Content-Type', value: 'application/json', type: 'text' });
    request.body = { mode: 'raw', raw: JSON.stringify(bodies[bodyKey], null, 2), options: { raw: { language: 'json' } } };
  }

  const item = { name, request, response: [] };
  if (bodyKey === 'login') {
    item.event = [{ listen: 'test', script: { exec: ["const json = pm.response.json();", "if (json.access_token) pm.collectionVariables.set('accessToken', json.access_token);"] } }];
  }
  return item;
}

const variables = [
  ['baseUrl', 'http://localhost:3000/api'], ['accessToken', ''], ['verificationToken', ''],
  ['userId', ''], ['productId', ''], ['brandId', '1'], ['categoryId', '1'], ['acTypeId', '1'],
  ['cartItemId', '1'], ['wishlistItemId', '1'], ['orderId', ''], ['imageId', '1'], ['reviewId', '1'],
  ['discountId', '1'], ['featuredProductId', '1'], ['sponsoredBrandId', '1'], ['bannerId', '1'],
  ['projectId', '1'], ['articleId', '1'], ['socialMediaId', '1'], ['staffId', '1'],
].map(([key, value]) => ({ key, value, type: 'string' }));

const item = Object.entries(groups).map(([name, requests]) => ({
  name,
  description: `Request fitur ${name}. Baca docs/handover/03-inventaris-api.md untuk hak akses dan catatan operasional.`,
  item: requests.map(makeRequest),
}));

const count = item.reduce((total, folder) => total + folder.item.length, 0);
if (count !== 104) throw new Error(`Jumlah request harus 104, tetapi hasilnya ${count}`);

const collection = {
  info: {
    _postman_id: 'b18b628f-7e99-4d6c-85a2-0a1a0c8b3206',
    name: 'ACSA Backend API',
    description: 'Koleksi handover ACSA Backend. Berisi 104 endpoint dari controller per 9 September 2026. Isi variabel dengan data uji. Jangan simpan token, password, service key, atau data pelanggan sebelum collection dibagikan.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  item,
  variable: variables,
};

writeFileSync('acsa-backend.postman_collection.json', `${JSON.stringify(collection, null, 2)}\n`);
console.log(`Menulis ${count} request ke acsa-backend.postman_collection.json`);
