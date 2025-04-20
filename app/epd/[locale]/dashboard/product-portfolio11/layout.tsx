"use client"

import { ReactNode } from 'react'

export default function ProductPortfolioLayout({ 
  children 
}: { 
  children: ReactNode 
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {children}
    </div>
  )
}
