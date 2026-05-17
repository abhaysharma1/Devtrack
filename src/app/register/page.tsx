"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Loader2, Eye, EyeOff, GraduationCap, User } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState("STUDENT")
  const reducedMotion = useReducedMotion()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const data = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      password: form.get("password") as string,
      confirmPassword: form.get("confirmPassword") as string,
      role: role,
      studentId: form.get("studentId") as string,
      department: form.get("department") as string,
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || "Registration failed")
        return
      }

      toast.success("Account created! Please sign in.")
      setRedirecting(true)
      router.push("/login")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const container = {
    hidden: reducedMotion ? {} : { opacity: 0 },
    show: reducedMotion ? {} : {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  }

  const item = {
    hidden: reducedMotion ? {} : { opacity: 0, y: 15 },
    show: reducedMotion ? {} : { opacity: 1, y: 0 },
  }

  if (redirecting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
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
        className="w-full max-w-lg"
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
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>Join the Software Project Management System</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <motion.div variants={container} initial="hidden" animate="show">
                <motion.div variants={item} className="space-y-2 mb-4">
                  <Label>I am a</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("STUDENT")}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border-2 p-3 transition-all duration-200",
                        role === "STUDENT"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      )}
                    >
                      <div className={cn(
                        "rounded-full p-2 transition-colors",
                        role === "STUDENT" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        <User className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Student</p>
                        <p className="text-xs text-muted-foreground">Enrolled in courses</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("TEACHER")}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border-2 p-3 transition-all duration-200",
                        role === "TEACHER"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      )}
                    >
                      <div className={cn(
                        "rounded-full p-2 transition-colors",
                        role === "TEACHER" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Teacher</p>
                        <p className="text-xs text-muted-foreground">Manages classes</p>
                      </div>
                    </button>
                  </div>
                </motion.div>

                <motion.div variants={item} className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" placeholder="John Doe" required className="transition-all duration-200 focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="you@college.edu" required className="transition-all duration-200 focus:ring-2 focus:ring-primary/20" />
                  </div>
                </motion.div>

                <motion.div variants={item} className="space-y-2 mb-4">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      required
                      minLength={8}
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

                <motion.div variants={item} className="space-y-2 mb-4">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat your password"
                    required
                    minLength={8}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </motion.div>

                <motion.div variants={item} className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student/Teacher ID</Label>
                    <Input id="studentId" name="studentId" placeholder="e.g. STU001" className="transition-all duration-200 focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" name="department" placeholder="Computer Science" className="transition-all duration-200 focus:ring-2 focus:ring-primary/20" />
                  </div>
                </motion.div>
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
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </motion.div>
              <motion.p
                initial={reducedMotion ? {} : { opacity: 0 }}
                animate={reducedMotion ? {} : { opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="text-sm text-muted-foreground text-center"
              >
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline underline-offset-4 font-medium">
                  Sign in
                </Link>
              </motion.p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
