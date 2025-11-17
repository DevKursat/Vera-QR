'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QrCode, Download, Edit, Trash } from 'lucide-react'
import QRCode from 'qrcode'

interface Table {
  id: string
  table_number: string
  location_description: string
  status: string
  qr_code: string
}

interface Props {
  tables: Table[]
  organization: any
}

export default function TablesManagement({ tables, organization }: Props) {
  const [generatingQR, setGeneratingQR] = useState<string | null>(null)

  const downloadQRCode = async (table: Table) => {
    setGeneratingQR(table.id)
    try {
      const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://veraqr.com'}/${organization.slug}?table=${table.id}`
      
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
      ctx.fillStyle = organization.brand_color || '#000000'
      ctx.font = 'bold 32px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(organization.name, 300, 50)

      // Table number
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 40px Arial'
      ctx.fillText(`Masa ${table.table_number}`, 300, 650)

      // Download
      const link = document.createElement('a')
      link.download = `Masa-${table.table_number}-QR.png`
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
      available: { label: 'Müsait', variant: 'default' },
      occupied: { label: 'Dolu', variant: 'destructive' },
      reserved: { label: 'Rezerve', variant: 'secondary' },
    }
    const { label, variant } = config[status] || config.available
    return <Badge variant={variant}>{label}</Badge>
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tables.length === 0 ? (
        <Card className="col-span-full">
          <CardContent className="text-center py-12">
            <p className="text-slate-500 mb-4">Henüz masa eklenmemiş.</p>
            <Button>Masa Ekle</Button>
          </CardContent>
        </Card>
      ) : (
        tables.map((table) => (
          <Card key={table.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>Masa {table.table_number}</CardTitle>
                {getStatusBadge(table.status)}
              </div>
              {table.location_description && (
                <p className="text-sm text-slate-600 mt-2">
                  {table.location_description}
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
                  onClick={() => downloadQRCode(table)}
                  disabled={generatingQR === table.id}
                >
                  <Download className="h-4 w-4 mr-1" />
                  {generatingQR === table.id ? 'Hazırlanıyor...' : 'İndir'}
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
