import NextAuth, { DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { UserModel } from './db/models'
import { UserRole } from '@/types'
import { config } from './config'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: UserRole
    } & DefaultSession['user']
  }

  interface User {
    id: string
    email: string
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await UserModel.findOne({
            where: { email: credentials.email as string },
          })

          if (!user) {
            return null
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          )

          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: config.auth.secret,
})

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.VIEWER]: 0,
    [UserRole.OPERATOR]: 1,
    [UserRole.ADMIN]: 2,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
