import { NextResponse } from 'next/server'

// Plus nécessaire avec NextAuth côté client; on garde pour compat net si appelé
export async function POST() {
  return NextResponse.json({ message: 'Déconnexion NextAuth' })
}
