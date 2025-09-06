import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  
  // Utiliser l'adaptateur Supabase officiel (selon documentation MCP)
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const supabase = getSupabaseAdmin()
          
          // Récupérer l'utilisateur depuis Supabase
          const { data: user, error } = await supabase
            .from('users')
            .select('id, email, name, role, password')
            .eq('email', credentials.email as string)
            .single()

          if (error || !user) {
            console.log('Utilisateur non trouvé:', credentials.email)
            return null
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isValidPassword) {
            console.log('Mot de passe invalide pour:', credentials.email)
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || '',
            role: user.role,
          }
        } catch (error) {
          console.error('Erreur d\'authentification:', error)
          return null
        }
      }
    })
  ],
  
  session: {
    strategy: 'jwt'
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    
    // Génération du token Supabase (selon documentation MCP)
    async session({ session, user }) {
      const signingSecret = process.env.SUPABASE_JWT_SECRET
      if (signingSecret && user) {
        const payload = {
          aud: "authenticated",
          exp: Math.floor(new Date(session.expires).getTime() / 1000),
          sub: user.id,
          email: user.email,
          role: "authenticated",
        }
        session.supabaseAccessToken = jwt.sign(payload, signingSecret)
      }
      
      if (user) {
        session.user.id = user.id
        session.user.role = (user as any).role
      }
      
      return session
    }
  },
  
  pages: {
    signIn: '/login',
  }
})

// Pour la compatibilité avec l'ancienne API
export const authOptions = {
  providers: [],
  session: { strategy: 'jwt' as const },
  callbacks: {}
}
