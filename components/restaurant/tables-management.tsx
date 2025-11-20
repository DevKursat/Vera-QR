'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QrCode, Download, Edit } from 'lucide-react'
import QRCode from 'qrcode'

interface QrCodeItem {
  id: string
  table_number: string
  location_description: string | null
  status: string
  qr_code_hash: string
}

interface Props {
  qrCodes: QrCodeItem[]
  restaurant: any
}

export default function TablesManagement({ qrCodes, restaurant }: Props) {
  const [generatingQR, setGeneratingQR] = useState<string | null>(null)

  const downloadQRCode = async (qrCode: QrCodeItem) => {
    setGeneratingQR(qrCode.id)
    try {
      // URL format: veraqr.com/slug?table=qr_hash
      const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://veraqr.com'}/${restaurant.slug}?table=${qrCode.qr_code_hash}`
      
      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, url, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })

      // Create a larger canvas with branding
      const finalCanvas = document.createElement('canvas')
      const ctx = finalCanvas.getContext('2d')!
      finalCanvas.width = 600
      finalCanvas.height = 700

      // White background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, 600, 700)

      // Draw QR code
      ctx.drawImage(canvas, 44, 100, 512, 512)

      // Title
      ctx.fillStyle = restaurant.primary_color || '#000000'
      ctx.font = 'bold 32px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(restaurant.name, 300, 50)

      // Table number
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 40px Arial'
      ctx.fillText(qrCode.table_number, 300, 650)

      // Download
      const link = document.createElement('a')
      link.download = `Masa-${qrCode.table_number.replace(' ', '-')}-QR.png`
      link.href = finalCanvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('QR code generation error:', error)
      alert('QR kod oluşturulurken hata oluştu')
    } finally {
      setGeneratingQR(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      active: { label: 'Aktif', variant: 'default' },
      inactive: { label: 'Pasif', variant: 'secondary' },
      damaged: { label: 'Hasarlı', variant: 'destructive' },
    }
    const { label, variant } = config[status] || { label: status, variant: 'secondary' }
    return <Badge variant={variant}>{label}</Badge>
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {qrCodes.length === 0 ? (
        <Card className="col-span-full">
          <CardContent className="text-center py-12">
            <p className="text-slate-500 mb-4">Henüz masa eklenmemiş.</p>
            <Button>Masa Ekle</Button>
          </CardContent>
        </Card>
      ) : (
        qrCodes.map((qrCode) => (
          <Card key={qrCode.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>{qrCode.table_number}</CardTitle>
                {getStatusBadge(qrCode.status)}
              </div>
              {qrCode.location_description && (
                <p className="text-sm text-slate-600 mt-2">
                  {qrCode.location_description}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-center p-4 bg-slate-50 rounded-lg">
                <QrCode className="h-24 w-24 text-slate-400" />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => downloadQRCode(qrCode)}
                  disabled={generatingQR === qrCode.id}
                >
                  <Download className="h-4 w-4 mr-1" />
                  {generatingQR === qrCode.id ? 'Hazırlanıyor...' : 'İndir'}
                </Button>
                <Button size="sm" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
