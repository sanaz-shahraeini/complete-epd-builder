"use client"

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const t = useTranslations('NotFound')

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* 404 SVG Illustration */}
        <div className="w-full max-w-[400px] mx-auto mb-8">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-32 h-32 mx-auto text-teal-400/30 dark:text-teal-300/20"
          >
            <path
              d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V8.625M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 13L15 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 17L12 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 404 Text */}
        <h1 className="text-5xl font-bold tracking-tight text-teal-500 dark:text-teal-400">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('heading')}</h2>
        
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400">
          {t('description')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button 
            asChild 
            className="bg-teal-500 hover:bg-teal-600 text-white dark:bg-teal-600 dark:hover:bg-teal-700 dark:text-white" 
            size="lg"
          >
            <Link href="/">
              {t('goHome')}
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900
                     dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100"
            onClick={() => window.history.back()}
          >
            {t('goBack')}
          </Button>
        </div>
      </div>
    </div>
  )
}
