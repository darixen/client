import { cache } from 'react'
import { cookies } from 'next/headers'

const PAYLOAD_API_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000'

/**
 * Enterprise-level fetcher for decoupled architectures.
 * Uses React Cache to prevent redundant cross-server network hits.
 */
export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) return null

  try {
    const res = await fetch(`${PAYLOAD_API_URL}/api/users/me`, {
      headers: {
        // Forward the token in the format Payload expects
        Authorization: `JWT ${token}`, 
        'Content-Type': 'application/json',
      },
    })

    const data = await res.json()
    return data?.user ?? null
  } catch (error) {
    return null
  }
})
