'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('Error')

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Error SVG Illustration */}
        <div className="w-full max-w-[400px] mx-auto mb-8">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-32 h-32 mx-auto text-teal-400/30 dark:text-teal-300/20"
          >
            <path
              d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Error Text */}
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight text-teal-500 dark:text-teal-400">
            Oops!
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t('title')}
          </h2>
        </div>
        
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400">
          {t('message')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button 
            onClick={reset}
            className="bg-teal-500 hover:bg-teal-600 text-white dark:bg-teal-600 dark:hover:bg-teal-700 dark:text-white" 
            size="lg"
          >
            {t('tryAgain')}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900
                     dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100"
            onClick={() => window.history.back()}
          >
            Go back
          </Button>
        </div>

        {/* Error Details - Only shown in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono break-all">
              {error.message || error.digest}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
