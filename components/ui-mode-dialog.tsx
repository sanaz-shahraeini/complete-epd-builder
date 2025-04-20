'use client'

import { X, MonitorDot, Blocks } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

import { useRouter } from 'next/navigation'
import { toast } from "sonner"

interface UIModeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UIModeDialog({ open, onOpenChange }: UIModeDialogProps) {
  const router = useRouter()

  const handleModeSelect = (mode: 'phase-base' | 'free-ui') => {
    if (mode === 'phase-base') {
      toast.info("Phase Base UI is coming soon!", {
        description: "This feature is currently under development.",
      })
      return
    }
    onOpenChange(false)
    router.push(`/product-portfolio/manual-entry/${mode}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <DialogTitle className="text-2xl font-semibold">Choose Your UI Mode</DialogTitle>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Select how you would like to enter your data manually.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => handleModeSelect('phase-base')}
            className="group relative flex flex-col items-center text-left border rounded-lg p-6 hover:border-teal-600 hover:shadow-lg transition-all"
          >
            <div className="absolute top-4 right-4 bg-teal-100 text-teal-700 text-xs font-medium px-2.5 py-1 rounded">
              Coming Soon
            </div>
            <div className="h-12 w-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
              <Blocks className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-teal-600">Phase Base</h3>
            <p className="text-gray-600 mb-6">
              Enter data in a structured, phase-by-phase approach.
            </p>
            <ul className="space-y-3 w-full">
              <li className="flex items-center text-gray-600">
                <svg className="h-5 w-5 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Step-by-step guidance
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="h-5 w-5 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Organized workflow
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="h-5 w-5 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Clear progress tracking
              </li>
            </ul>
          </button>

          <button
            onClick={() => handleModeSelect('free-ui')}
            className="group relative flex flex-col items-center text-left border rounded-lg p-6 hover:border-teal-600 hover:shadow-lg transition-all"
          >
            <div className="h-12 w-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
              <MonitorDot className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-teal-600">Free UI</h3>
            <p className="text-gray-600 mb-6">
              Flexible data entry with complete freedom of navigation.
            </p>
            <ul className="space-y-3 w-full">
              <li className="flex items-center text-gray-600">
                <svg className="h-5 w-5 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Unrestricted navigation
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="h-5 w-5 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Custom workflow
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="h-5 w-5 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Quick data entry
              </li>
            </ul>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
