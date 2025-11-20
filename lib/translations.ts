// Language translations
export const translations = {
  tr: {
    // Common
    common: {
      login: 'Giriş Yap',
      logout: 'Çıkış Yap',
      save: 'Kaydet',
      cancel: 'İptal',
      delete: 'Sil',
      edit: 'Düzenle',
      add: 'Ekle',
      search: 'Ara',
      loading: 'Yükleniyor...',
      error: 'Hata',
      success: 'Başarılı',
    },
    // Landing Page
    landing: {
      title: 'AI Destekli QR Menü Sistemi',
      subtitle: 'Restoranınız için yapay zeka destekli dijital menü sistemi. Müşterileriniz QR kod okutarak menüyü görüntülesin, AI asistan ile konuşsun ve sipariş versin.',
      features: 'Özellikler',
      pricing: 'Fiyatlandırma',
      login: 'Giriş Yap',
      moreInfo: 'Daha Fazla Bilgi',
    },
    // Auth
    auth: {
      loginTitle: 'Admin Paneline Giriş',
      email: 'E-posta',
      password: 'Şifre',
      loggingIn: 'Giriş yapılıyor...',
      loginSuccess: 'Giriş Başarılı',
      loginError: 'Giriş Başarısız',
      invalidCredentials: 'E-posta veya şifre hatalı.',
      unauthorized: 'Yetkisiz Erişim',
      unauthorizedMessage: 'Bu hesapla giriş yapamazsınız.',
    },
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      statistics: 'Anlık İstatistikler',
      quickActions: 'Hızlı İşlemler',
      todayOrders: 'Bugünkü Siparişler',
      todayRevenue: 'Bugünkü Ciro',
      pendingOrders: 'Bekleyen Siparişler',
      avgOrder: 'Ort. Sipariş',
      editMenu: 'Menü Düzenle',
      orders: 'Siparişler',
      qrCodes: 'QR Kodlar',
      analytics: 'Analitik',
    },
    // Menu
    menu: {
      management: 'Menü Yönetimi',
      categories: 'Kategoriler',
      products: 'Ürünler',
      newCategory: 'Yeni Kategori',
      newProduct: 'Yeni Ürün',
      name: 'İsim',
      nameTr: 'İsim (Türkçe)',
      nameEn: 'İsim (İngilizce)',
      description: 'Açıklama',
      descriptionTr: 'Açıklama (Türkçe)',
      descriptionEn: 'Açıklama (İngilizce)',
      price: 'Fiyat',
      image: 'Görsel',
      available: 'Mevcut',
    },
    // Admin
    admin: {
      platformManagement: 'Platform Yönetimi',
      organizations: 'İşletmeler',
      newOrganization: 'Yeni İşletme Ekle',
      totalOrganizations: 'Toplam İşletme',
      totalUsers: 'Toplam Kullanıcı',
      totalOrders: 'Toplam Sipariş',
      growth: 'Büyüme',
    },
  },
  en: {
    // Common
    common: {
      login: 'Login',
      logout: 'Logout',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
    // Landing Page
    landing: {
      title: 'AI-Powered QR Menu System',
      subtitle: 'AI-powered digital menu system for your restaurant. Let your customers view the menu by scanning QR codes, chat with AI assistant and place orders.',
      features: 'Features',
      pricing: 'Pricing',
      login: 'Login',
      moreInfo: 'Learn More',
    },
    // Auth
    auth: {
      loginTitle: 'Admin Panel Login',
      email: 'Email',
      password: 'Password',
      loggingIn: 'Logging in...',
      loginSuccess: 'Login Successful',
      loginError: 'Login Failed',
      invalidCredentials: 'Invalid email or password.',
      unauthorized: 'Unauthorized Access',
      unauthorizedMessage: 'You cannot login with this account.',
    },
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      statistics: 'Live Statistics',
      quickActions: 'Quick Actions',
      todayOrders: "Today's Orders",
      todayRevenue: "Today's Revenue",
      pendingOrders: 'Pending Orders',
      avgOrder: 'Avg. Order',
      editMenu: 'Edit Menu',
      orders: 'Orders',
      qrCodes: 'QR Codes',
      analytics: 'Analytics',
    },
    // Menu
    menu: {
      management: 'Menu Management',
      categories: 'Categories',
      products: 'Products',
      newCategory: 'New Category',
      newProduct: 'New Product',
      name: 'Name',
      nameTr: 'Name (Turkish)',
      nameEn: 'Name (English)',
      description: 'Description',
      descriptionTr: 'Description (Turkish)',
      descriptionEn: 'Description (English)',
      price: 'Price',
      image: 'Image',
      available: 'Available',
    },
    // Admin
    admin: {
      platformManagement: 'Platform Management',
      organizations: 'Organizations',
      newOrganization: 'Add New Organization',
      totalOrganizations: 'Total Organizations',
      totalUsers: 'Total Users',
      totalOrders: 'Total Orders',
      growth: 'Growth',
    },
  },
} as const

export type Language = keyof typeof translations
export type TranslationKeys = typeof translations['tr' | 'en']
