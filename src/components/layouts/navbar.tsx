"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Moon, Sun, LogOut, User, Settings, Search, Loader2 } from "lucide-react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getInitials } from "@/lib/utils"
import Link from "next/link"
import { useSearch } from "@/components/providers/search-provider"

export function Navbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { setOpen: setSearchOpen } = useSearch()
  const [signingOut, setSigningOut] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const res = await fetch("/api/notifications?count=true")
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.count)
        }
      } catch { /* ignore */ }
    }
    fetchUnreadCount()

    const eventSource = new EventSource("/api/notifications/stream")
    eventSource.addEventListener("notification", () => {
      setUnreadCount((prev) => prev + 1)
    })
    eventSource.onerror = () => {
      eventSource.close()
    }
    return () => eventSource.close()
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <div className="lg:hidden w-10" />

      <div className="flex-1" />

      <button
        onClick={() => setSearchOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors w-full max-w-[200px]"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-auto hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Link href="/notifications" className="relative inline-flex items-center justify-center rounded-lg border border-border bg-background hover:bg-muted h-8 w-8">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 min-w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>

      <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger className="relative h-9 w-9 rounded-full outline-none cursor-pointer">
          <Avatar className="h-9 w-9">
            <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
            <AvatarFallback>{getInitials(session?.user?.name || "U")}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
          <div className="px-1.5 py-2">
            <p className="text-sm font-medium">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{session?.user?.role?.toLowerCase()}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              setSigningOut(true)
              await signOut({ callbackUrl: "/login" })
            }}
            disabled={signingOut}
            className="text-destructive focus:text-destructive"
          >
            {signingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
            {signingOut ? "Signing out..." : "Sign Out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
