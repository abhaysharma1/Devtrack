"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, CheckCheck, Trash2, Loader2 } from "lucide-react"
import { formatDateRelative } from "@/lib/utils"
import { toast } from "sonner"

interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  const [total, setTotal] = useState(0)
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    fetchNotifications(true)

    const eventSource = new EventSource("/api/notifications/stream")
    eventSource.addEventListener("notification", (event) => {
      try {
        const data = JSON.parse(event.data)
        setNotifications((prev) => [data, ...prev])
        setTotal((prev) => prev + 1)
      } catch { /* ignore */ }
    })
    eventSource.onerror = () => eventSource.close()
    return () => eventSource.close()
  }, [])

  async function fetchNotifications(reset = false) {
    if (reset) setLoading(true)
    else setLoadingMore(true)
    try {
      const params = new URLSearchParams()
      if (!reset && nextCursor) params.set("cursor", nextCursor)
      params.set("limit", "50")
      const res = await fetch(`/api/notifications?${params}`)
      if (res.ok) {
        const data = await res.json()
        if (reset) {
          setNotifications(data.items)
          setNextCursor(data.nextCursor)
          setTotal(data.total)
        } else {
          setNotifications((prev) => [...prev, ...data.items])
          setNextCursor(data.nextCursor)
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  async function markAllRead() {
    setMarkingAll(true)
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        toast.success("All marked as read")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setMarkingAll(false)
    }
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" })
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  async function deleteNotification(id: string) {
    const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" })
    if (res.ok) {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      toast.success("Notification deleted")
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={markingAll}>
            {markingAll ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <CheckCheck className="mr-1 h-3 w-3" />}
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No notifications</h3>
          <p className="text-sm text-muted-foreground">You&apos;re all caught up!</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 p-4 transition-colors ${!n.isRead ? "bg-muted/50" : ""} ${n.link ? "cursor-pointer hover:bg-muted/80" : ""}`}
                  onClick={() => {
                    if (!n.isRead) markRead(n.id)
                    if (n.link) router.push(n.link)
                  }}
                >
                  <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${n.isRead ? "bg-transparent" : "bg-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDateRelative(n.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-xs">{n.type.replace("_", " ")}</Badge>
                    {!n.isRead && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); markRead(n.id) }}>
                        <CheckCheck className="h-3 w-3" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {nextCursor && (
              <div className="flex justify-center border-t p-4">
                <Button variant="outline" size="sm" onClick={() => fetchNotifications(false)} disabled={loadingMore}>
                  {loadingMore ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                  {loadingMore ? "Loading..." : `Load more (${notifications.length}/${total})`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
