"use client"

import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const reducedMotion = useReducedMotion()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = form.get("email") as string
    const password = form.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid email or password")
        return
      }

      let session
      for (let i = 0; i < 3; i++) {
        if (i > 0) await new Promise((r) => setTimeout(r, 200))
        const res = await fetch("/api/auth/session")
        session = await res.json()
        if (session?.user?.role) break
      }

      const role = session?.user?.role

      setRedirecting(true)
      if (role === "ADMIN") router.push("/admin")
      else if (role === "TEACHER") router.push("/teacher")
      else if (role === "STUDENT") router.push("/student")
      else {
        toast.error("Unable to determine user role. Please try again.")
        setRedirecting(false)
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (redirecting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <Card className="relative border-border/50 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={reducedMotion ? {} : { scale: 0.8, opacity: 0 }}
              animate={reducedMotion ? {} : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center mb-4"
            >
              <div className="rounded-full bg-gradient-to-br from-primary to-primary/70 p-3 shadow-lg">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to your SPMS account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <motion.div
                initial={reducedMotion ? {} : { opacity: 0, x: -10 }}
                animate={reducedMotion ? {} : { opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@college.edu"
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </motion.div>
              <motion.div
                initial={reducedMotion ? {} : { opacity: 0, x: -10 }}
                animate={reducedMotion ? {} : { opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline underline-offset-4 transition-opacity hover:opacity-80"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <motion.div
                initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="w-full"
              >
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <span>Sign In</span>
                  )}
                </Button>
              </motion.div>
              <motion.p
                initial={reducedMotion ? {} : { opacity: 0 }}
                animate={reducedMotion ? {} : { opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="text-sm text-muted-foreground text-center"
              >
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary hover:underline underline-offset-4 font-medium">
                  Sign up
                </Link>
              </motion.p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
