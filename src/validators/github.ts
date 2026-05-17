import { z } from "zod"

export const linkRepositorySchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  fullName: z.string().min(1, "Repository full name is required (e.g. owner/repo)"),
})

export const syncRepoSchema = z.object({
  repoId: z.string().optional(),
  projectId: z.string().optional(),
})

export type LinkRepositoryInput = z.infer<typeof linkRepositorySchema>
export type SyncRepoInput = z.infer<typeof syncRepoSchema>
