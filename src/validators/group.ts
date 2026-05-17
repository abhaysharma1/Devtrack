import { z } from "zod"

export const groupSchema = z.object({
  name: z.string().min(2).max(100),
  classId: z.string().uuid(),
  maxSize: z.number().int().min(1).max(20).default(5),
})

export const joinGroupSchema = z.object({
  inviteCode: z.string().min(1),
})

export const joinRequestSchema = z.object({
  groupId: z.string().uuid(),
})

export const approveRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
})

export type GroupInput = z.infer<typeof groupSchema>
export type JoinGroupInput = z.infer<typeof joinGroupSchema>
export type JoinRequestInput = z.infer<typeof joinRequestSchema>
export type ApproveRequestInput = z.infer<typeof approveRequestSchema>
