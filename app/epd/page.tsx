import { redirect } from 'next/navigation'
import { defaultLocale } from '../../i18n/navigation'

export default function EpdPage() {
  // Redirect to the default locale
  redirect(`/epd/${defaultLocale}/signin`)
}
