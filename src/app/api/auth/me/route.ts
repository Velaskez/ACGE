import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getServerUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    return NextResponse.json({
      user: {
        id: authUser.userId,
        role: authUser.role,
        email: authUser.email || '',
        name: authUser.name || ''
      }
    })

  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error)
    return NextResponse.json(
      { error: 'Token invalide' },
      { status: 401 }
    )
  }
}
