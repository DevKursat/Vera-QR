'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, ExternalLink, QrCode, Trash } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  status: string
  subscription_tier: string
  created_at: string
}

interface Props {
  organizations: Organization[]
}

export default function OrganizationsList({ organizations }: Props) {
  const router = useRouter()

  if (organizations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Henüz işletme eklenmemiş.</p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      active: 'default',
      suspended: 'destructive',
      pending: 'secondary',
    }
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status === 'active' ? 'Aktif' : status === 'suspended' ? 'Askıya Alındı' : 'Beklemede'}
      </Badge>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>İşletme</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Oluşturulma</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => (
            <TableRow key={org.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {org.logo_url ? (
                    <img
                      src={org.logo_url}
                      alt={org.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                      <span className="text-lg font-bold text-slate-600">
                        {org.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{org.name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                  /{org.slug}
                </code>
              </TableCell>
              <TableCell>{getStatusBadge(org.status)}</TableCell>
              <TableCell className="capitalize">{org.subscription_tier}</TableCell>
              <TableCell className="text-sm text-slate-600">
                {formatDistanceToNow(new Date(org.created_at), {
                  addSuffix: true,
                  locale: tr,
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/${org.slug}`} target="_blank">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/organizations/${org.id}/qr`}>
                    <Button variant="ghost" size="sm">
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/organizations/${org.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
