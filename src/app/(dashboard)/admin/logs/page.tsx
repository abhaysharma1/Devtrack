import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateRelative } from "@/lib/utils"
import { Activity } from "lucide-react"

export default async function AdminLogsPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/login")

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">System audit trail and activity history</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="secondary">{log.action}</Badge>
                  <span className="text-sm text-muted-foreground">{log.entityType}/{log.entityId.slice(0, 8)}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatDateRelative(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
