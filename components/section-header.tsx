import { type LucideIcon } from 'lucide-react'

interface SectionHeaderProps {
  icon: LucideIcon
  title: string
  className?: string
}

export function SectionHeader({ icon: Icon, title, className }: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-2 text-teal-600 ${className}`}>
      <Icon className="h-5 w-5" />
      <h2 className="text-base font-medium">{title}</h2>
    </div>
  )
}

