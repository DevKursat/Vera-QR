'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useDebounce } from 'use-debounce'
import { slugify } from '@/lib/utils'

interface SlugInputProps {
  value: string
  onChange: (value: string, isValid: boolean) => void
  currentId?: string // To exclude current restaurant from check
  label?: string
  disabled?: boolean
}

export default function SlugInput({ value, onChange, currentId, label = "URL Slug", disabled = false }: SlugInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const [debouncedValue] = useDebounce(inputValue, 500)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const checkAvailability = useCallback(async (slug: string) => {
    if (!slug) {
      setIsValid(null)
      setErrorMessage('')
      return
    }

    setIsLoading(true)
    try {
      let query = supabase
        .from('restaurants')
        .select('id')
        .eq('slug', slug)

      if (currentId) {
        query = query.neq('id', currentId)
      }

      const { data, error } = await query.maybeSingle()

      if (error) {
        console.error('Slug check error:', error)
        setIsValid(false)
        setErrorMessage('Kontrol edilirken hata oluştu')
        onChange(slug, false)
      } else if (data) {
        setIsValid(false)
        setErrorMessage('Bu slug kullanımda')
        onChange(slug, false)
      } else {
        setIsValid(true)
        setErrorMessage('')
        onChange(slug, true)
      }
    } catch (err) {
      console.error(err)
      setIsValid(false)
      onChange(slug, false)
    } finally {
      setIsLoading(false)
    }
  }, [currentId, onChange])

  useEffect(() => {
    checkAvailability(debouncedValue)
  }, [debouncedValue, checkAvailability])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = slugify(e.target.value)
    setInputValue(newValue)
    // Temporarily invalid until check completes
    onChange(newValue, false)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="slug-input">{label} *</Label>
      <div className="relative">
        <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">veraqr.com/</span>
            <Input
            id="slug-input"
            value={inputValue}
            onChange={handleChange}
            placeholder="ornek-restoran"
            className={`pr-10 ${
                isValid === true ? 'border-green-500 focus-visible:ring-green-500' :
                isValid === false ? 'border-red-500 focus-visible:ring-red-500' : ''
            }`}
            disabled={disabled}
            />
        </div>
        <div className="absolute right-3 top-2.5">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          ) : isValid === true ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : isValid === false ? (
            <X className="h-5 w-5 text-red-500" />
          ) : null}
        </div>
      </div>
      {errorMessage && (
        <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  )
}
