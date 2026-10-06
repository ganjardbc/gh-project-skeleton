import id from '~/locales/id'
import en from '~/locales/en'
import type { Messages } from '~/locales/id'

const messages: Record<string, Messages> = { id, en }

// Typed copy for the active language. Routing and the current locale come from
// @nuxtjs/i18n; the text itself is plain objects, so arrays and nested items
// keep their types.
export function useMessages() {
  const { locale } = useI18n()
  return computed<Messages>(() => messages[locale.value] ?? id)
}
