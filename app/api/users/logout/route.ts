import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const PAYLOAD_API_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000'

export async function POST() {
  try {
    // Call the server logout endpoint if it exists
    await fetch(`${PAYLOAD_API_URL}/api/users/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {
      // Endpoint might not exist, continue anyway
    })

    // Clear the authentication cookie
    const cookieStore = await cookies()
    cookieStore.delete('payload-token')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
