"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/lib/store/user"

export default function DashboardPage() {
  const router = useRouter()
  const user = useUserStore((state) => state.user)

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      router.push('/en/dashboard/admin')
    } else {
      router.push('/en/dashboard/portfolio')
    }
  }, [router, user])

  return null
}