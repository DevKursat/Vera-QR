import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QrCode, Brain, Utensils, TrendingUp, Shield, Zap, Bot } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-background dark:to-background">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">VERAQR</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm hover:text-primary transition">
              Özellikler
            </Link>
            <Link href="#pricing" className="text-sm hover:text-primary transition">
              Fiyatlandırma
            </Link>
            <Link href="/admin/login" className="text-sm hover:text-primary transition">
              Giriş Yap
            </Link>
            <Button asChild>
              <Link href="/admin/register">Ücretsiz Dene</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          AI Destekli QR Menü Sistemi
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Restoranınız için yapay zeka destekli dijital menü sistemi. 
          Müşterileriniz QR kod okutarak menüyü görüntülesin, AI asistan ile konuşsun ve sipariş versin.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/admin/register">Hemen Başla</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#features">Daha Fazla Bilgi</Link>
          </Button>
        </div>
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-background dark:via-transparent dark:to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80"
            alt="QR Menu Demo"
            className="rounded-lg shadow-2xl mx-auto max-w-4xl"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Özellikler
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI Menü Asistanı</CardTitle>
              <CardDescription>
                GPT-4 destekli asistan, müşterilerinize ürün önerir ve sorularını yanıtlar
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <QrCode className="h-10 w-10 text-primary mb-2" />
              <CardTitle>QR Kod Sistemi</CardTitle>
              <CardDescription>
                Her masa için özel QR kod. Müşteriler telefonu ile okutup hemen menüyü görür
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Utensils className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Dinamik Menü</CardTitle>
              <CardDescription>
                Ürünleri anında güncelleyin, stok kontrolü yapın, kategori düzenleyin
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Analitik & Raporlar</CardTitle>
              <CardDescription>
                Satış raporları, popüler ürünler, yoğun saatler gibi detaylı analizler
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Güvenli & Ölçeklenebilir</CardTitle>
              <CardDescription>
                Enterprise seviye güvenlik, sınırsız masa ve ürün desteği
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Hızlı Kurulum</CardTitle>
              <CardDescription>
                5 dakikada hesap açın, menünüzü yükleyin ve QR kodlarınızı yazdırın
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Fiyatlandırma
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Starter</CardTitle>
              <CardDescription>Küçük işletmeler için</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">₺299</span>
                <span className="text-muted-foreground">/ay</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ 20 masa</li>
                <li>✓ Sınırsız ürün</li>
                <li>✓ AI Asistan (1000 mesaj/ay)</li>
                <li>✓ Temel raporlar</li>
                <li>✓ Email destek</li>
              </ul>
              <Button className="w-full mt-6" variant="outline" asChild>
                <Link href="/admin/register?plan=starter">Başla</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary shadow-lg scale-105">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>Orta ölçekli restoranlar</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">₺599</span>
                <span className="text-muted-foreground">/ay</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ 50 masa</li>
                <li>✓ Sınırsız ürün</li>
                <li>✓ AI Asistan (5000 mesaj/ay)</li>
                <li>✓ Gelişmiş raporlar</li>
                <li>✓ Kampanya yönetimi</li>
                <li>✓ Öncelikli destek</li>
              </ul>
              <Button className="w-full mt-6" asChild>
                <Link href="/admin/register?plan=pro">Başla</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>Restoran zincirleri</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">Özel</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Sınırsız masa</li>
                <li>✓ Sınırsız ürün</li>
                <li>✓ Sınırsız AI mesaj</li>
                <li>✓ Özel AI eğitimi</li>
                <li>✓ API erişimi</li>
                <li>✓ Çoklu lokasyon</li>
                <li>✓ 7/24 destek</li>
              </ul>
              <Button className="w-full mt-6" variant="outline" asChild>
                <Link href="/contact">İletişime Geç</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <QrCode className="h-6 w-6" />
                <span className="font-bold">VERAQR</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI destekli QR menü sistemi ile restoranınızı dijitalleştirin
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ürün</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features">Özellikler</Link></li>
                <li><Link href="#pricing">Fiyatlandırma</Link></li>
                <li><Link href="/docs">Dokümantasyon</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Şirket</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about">Hakkımızda</Link></li>
                <li><Link href="/contact">İletişim</Link></li>
                <li><Link href="/blog">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Yasal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy">Gizlilik</Link></li>
                <li><Link href="/terms">Şartlar</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 VERAQR. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  )
}
