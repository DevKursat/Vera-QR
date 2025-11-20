'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Eye, EyeOff, Plus, Trash } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Category {
  id: string
  name_tr: string
  visible: boolean | null
  display_order: number | null
}

interface Product {
  id: string
  category_id: string | null
  name_tr: string
  description_tr: string | null
  price: number
  image_url: string | null
  is_available: boolean | null
  stock_count: number | null
}

interface Props {
  categories: Category[]
  items: Product[]
}

export default function MenuCategoriesList({ categories, items }: Props) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const getItemsByCategory = (categoryId: string) => {
    return items.filter((item) => item.category_id === categoryId)
  }

  return (
    <div className="space-y-4">
      {categories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-slate-500 mb-4">Henüz kategori eklenmemiş.</p>
            <Link href="/dashboard/menu/categories/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                İlk Kategoriyi Ekle
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        categories.map((category) => {
          const categoryItems = getItemsByCategory(category.id)
          const isExpanded = expandedCategory === category.id

          return (
            <Card key={category.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpandedCategory(isExpanded ? null : category.id)
                    }
                  >
                    {isExpanded ? '▼' : '▶'}
                  </Button>
                  <CardTitle className="text-lg">{category.name_tr}</CardTitle>
                  <Badge variant={category.visible ? 'default' : 'secondary'}>
                    {category.visible ? 'Görünür' : 'Gizli'}
                  </Badge>
                  <span className="text-sm text-slate-500">
                    ({categoryItems.length} ürün)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/menu/categories/${category.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  {categoryItems.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <p className="mb-3">Bu kategoride henüz ürün yok.</p>
                      <Link href={`/dashboard/menu/items/new?category=${category.id}`}>
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Ürün Ekle
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {categoryItems.map((item) => (
                        <div
                          key={item.id}
                          className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
                        >
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.name_tr}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                          )}
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">{item.name_tr}</h4>
                            <Badge
                              variant={item.is_available ? 'default' : 'destructive'}
                            >
                              {item.is_available ? (
                                <Eye className="h-3 w-3" />
                              ) : (
                                <EyeOff className="h-3 w-3" />
                              )}
                            </Badge>
                          </div>
                          {item.description_tr && (
                            <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                              {item.description_tr}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-green-600">
                              ₺{item.price.toFixed(2)}
                            </span>
                            <Link href={`/dashboard/menu/items/${item.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-3 w-3 mr-1" />
                                Düzenle
                              </Button>
                            </Link>
                          </div>
                          {item.stock_count !== null && (
                            <div className="mt-2 text-xs text-slate-500">
                              Stok: {item.stock_count}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })
      )}
    </div>
  )
}
