"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BookOpen,
  LayoutDashboard,
  FolderKanban,
  Users,
  GraduationCap,
  BarChart3,
  Bell,
  Settings,
  UserCircle,
  Shield,
  LogOut,
  ChevronLeft,
  Menu,
  ClipboardList,
  GitBranch,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"

interface SidebarItem {
  title: string
  href: string
  icon: React.ReactNode
  roles: string[]
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/teacher",
    icon: <LayoutDashboard className="h-4 w-4" />,
    roles: ["TEACHER", "ADMIN"],
  },
  {
    title: "Classes",
    href: "/teacher/classes",
    icon: <GraduationCap className="h-4 w-4" />,
    roles: ["TEACHER", "ADMIN"],
  },
  {
    title: "Projects",
    href: "/teacher/projects",
    icon: <FolderKanban className="h-4 w-4" />,
    roles: ["TEACHER", "ADMIN"],
  },
  {
    title: "Groups",
    href: "/teacher/groups",
    icon: <Users className="h-4 w-4" />,
    roles: ["TEACHER", "ADMIN"],
  },
  {
    title: "Analytics",
    href: "/teacher/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    roles: ["TEACHER", "ADMIN"],
  },
  {
    title: "Dashboard",
    href: "/student",
    icon: <LayoutDashboard className="h-4 w-4" />,
    roles: ["STUDENT"],
  },
  {
    title: "My Projects",
    href: "/student/projects",
    icon: <FolderKanban className="h-4 w-4" />,
    roles: ["STUDENT"],
  },
  {
    title: "My Groups",
    href: "/student/groups",
    icon: <Users className="h-4 w-4" />,
    roles: ["STUDENT"],
  },
  {
    title: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-4 w-4" />,
    roles: ["ADMIN"],
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: <Users className="h-4 w-4" />,
    roles: ["ADMIN"],
  },
  {
    title: "Classes",
    href: "/admin/classes",
    icon: <GraduationCap className="h-4 w-4" />,
    roles: ["ADMIN"],
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    roles: ["ADMIN"],
  },
  {
    title: "Logs",
    href: "/admin/logs",
    icon: <ClipboardList className="h-4 w-4" />,
    roles: ["ADMIN"],
  },
]

const bottomItems: SidebarItem[] = [
  {
    title: "Notifications",
    href: "/notifications",
    icon: <Bell className="h-4 w-4" />,
    roles: ["TEACHER", "STUDENT", "ADMIN"],
  },
  {
    title: "Profile",
    href: "/profile",
    icon: <UserCircle className="h-4 w-4" />,
    roles: ["TEACHER", "STUDENT", "ADMIN"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="h-4 w-4" />,
    roles: ["TEACHER", "STUDENT", "ADMIN"],
  },
]

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role || ""
  const [collapsed, setCollapsed] = useState(false)

  const filteredItems = sidebarItems.filter((item) => item.roles.includes(role))

  return (
    <>
      {/* Mobile Sheet */}
      <Sheet>
        <SheetTrigger className="fixed top-4 left-4 z-40 lg:hidden inline-flex items-center justify-center rounded-lg border border-border bg-background hover:bg-muted h-8 w-8 cursor-pointer">
            <Menu className="h-4 w-4" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent
            items={filteredItems}
            bottomItems={bottomItems}
            pathname={pathname}
            role={role}
            collapsed={false}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex h-screen flex-col border-r bg-card transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          className
        )}
      >
        <SidebarContent
          items={filteredItems}
          bottomItems={bottomItems}
          pathname={pathname}
          role={role}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </aside>
    </>
  )
}

function SidebarContent({
  items,
  bottomItems,
  pathname,
  role,
  collapsed,
  onToggle,
}: {
  items: SidebarItem[]
  bottomItems: SidebarItem[]
  pathname: string
  role: string
  collapsed: boolean
  onToggle?: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center border-b px-4 py-4", collapsed && "justify-center px-2")}>
        {!collapsed && (
          <>
            <BookOpen className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-lg">SPMS</span>
          </>
        )}
        {collapsed && <BookOpen className="h-6 w-6 text-primary" />}
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            className={cn("ml-auto h-6 w-6", collapsed && "ml-0 mt-2")}
            onClick={onToggle}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className={cn("grid gap-1 px-2", collapsed && "px-1")}>
          {items.map((item) => {
            const isActive = ["/teacher", "/student", "/admin"].includes(item.href) ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/")
            return collapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger className={cn(
                  "flex h-10 w-12 items-center justify-center rounded-lg transition-colors cursor-pointer",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                  onClick={() => window.location.href = item.href}
                >
                  {item.icon}
                </TooltipTrigger>
                <TooltipContent side="right">{item.title}</TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t py-2">
        <nav className={cn("grid gap-1 px-2", collapsed && "px-1")}>
          {bottomItems.map((item) => {
            const isActive = pathname === item.href
            return collapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger className={cn(
                  "flex h-10 w-12 items-center justify-center rounded-lg transition-colors cursor-pointer",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
                )}
                  onClick={() => window.location.href = item.href}
                >
                  {item.icon}
                </TooltipTrigger>
                <TooltipContent side="right">{item.title}</TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
