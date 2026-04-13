"use server"
import { setCookie } from 'cookies-next'
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.errors?.[0]?.message)

  const cookieStore = await cookies()
  cookieStore.set('payload-token', data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only HTTPS in prod
    sameSite: 'lax', 
    path: '/', // Ensure it's available site-wide
  })

  return data
}

export async function register(email: string, password: string, fullName: string) {
  const res = await fetch(`${API_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName }),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMessage = data.errors?.[0]?.message || 'Registration failed.';
    throw new Error(errorMessage);
  }

  return data;
}