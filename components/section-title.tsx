import { TypeIcon as type, LucideIcon } from 'lucide-react'

interface SectionTitleProps {
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
}

export function SectionTitle({ icon: Icon, children, className }: SectionTitleProps) {
  return (
    <div className={`relative pb-2 ${className}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-teal-600" />}
        <h2 className="font-bold text-lg text-teal-600">{children}</h2>
      </div>
      <div className="absolute bottom-0 left-0 w-16 h-0.5 bg-teal-600" />
    </div>
  )
}

