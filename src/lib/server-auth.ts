import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export interface ServerUser {
  userId: string
  role: string
  email?: string
  name?: string
}

// Unifie l'obtention de l'utilisateur côté serveur:
// 1) Tente NextAuth (session JWT)
// 2) Fallback sur l'ancien cookie `auth-token` signé via jsonwebtoken
export async function getServerUser(request: NextRequest): Promise<ServerUser | null> {
  // 1) Session NextAuth (JWT)
  try {
    const session = await auth()
    if (session?.user?.id) {
      return {
        userId: session.user.id,
        role: session.user.role,
        email: session.user.email,
        name: session.user.name,
      }
    }
  } catch (_) {
    // ignore and try fallback
  }

  // 2) Fallback: ancien cookie signé `auth-token`
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null

    const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret'
    const payload = verify(token, secret) as { userId?: string; email?: string }
    if (!payload?.userId && !payload?.email) return null

    const user = payload.userId
      ? await prisma.user.findUnique({ where: { id: payload.userId } })
      : payload.email
      ? await prisma.user.findUnique({ where: { email: payload.email } })
      : null

    if (!user) {
      // Au minimum retourner l'ID si présent pour que les routes puissent fonctionner côté dev/tests
      if (payload.userId) {
        return {
          userId: payload.userId,
          role: 'user',
          email: payload.email,
          name: '',
        }
      }
      return null
    }

    return {
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.name || undefined,
    }
  } catch (_) {
    return null
  }
}


