import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("[AUTH_DEBUG] Missing credentials", { hasEmail: !!credentials?.email, hasPassword: !!credentials?.password })
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.passwordHash) {
          console.error("[AUTH_DEBUG] User lookup failed", { email, userFound: !!user, hasHash: !!user?.passwordHash })
          return null
        }
        if (user.isSuspended) {
          console.error("[AUTH_DEBUG] User suspended", { email })
          return null
        }

        console.error("[AUTH_DEBUG] bcryptjs keys available:", Object.keys(bcrypt).join(","))
        console.error("[AUTH_DEBUG] Stored hash:", { length: user.passwordHash.length, prefix: user.passwordHash.substring(0, 7), full: user.passwordHash })

        const isValid = await bcrypt.compare(password, user.passwordHash)
        console.error("[AUTH_DEBUG] bcrypt.compare result:", isValid)

        if (!isValid) return null

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
})
