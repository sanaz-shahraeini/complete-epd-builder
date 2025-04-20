"use client"

import { Suspense } from 'react'
import "@radix-ui/themes/styles.css";
import ProductForm  from "@/components/product-form"
import Loading from '@/app/loading'

export default function Page() {
  return (
    <main className="flex-1 p-4 md:p-8">
      <Suspense fallback={<Loading />}> 
        <ProductForm />
      </Suspense>
    </main>
  )
}
