"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { useRouter } from '@/i18n/navigation'
import { useState, useRef } from "react"

export default function ComingSoonPage() {
  const t = useTranslations('ComingSoon')
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-lg text-muted-foreground mb-8">{t('description')}</p>
          <Button
            onClick={() => router.back()}
            className="inline-flex items-center"
          >
            {t('backButton')}
          </Button>
        </div>
      </div>
    </div>
  )
}
