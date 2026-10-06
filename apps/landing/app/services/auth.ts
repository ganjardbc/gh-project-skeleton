import type { RegisterPayload } from '~/types/auth'

// Creates a merchant and its owner user. Throws an Error carrying the API's
// message, or `fallbackMessage` when the API gives none.
export async function registerMerchant(
  apiBaseUrl: string,
  payload: RegisterPayload,
  fallbackMessage: string,
): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const body = await response.json().catch(() => null)

  if (!response.ok || !body?.success) {
    throw new Error(body?.message || fallbackMessage)
  }
}
