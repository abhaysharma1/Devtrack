import { vi } from "vitest"

type MockPrismaClient = Record<string, Record<string, ReturnType<typeof vi.fn>>>

export function createMockPrisma() {
  const mockPrisma: MockPrismaClient = {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    class: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    group: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    groupMember: {
      create: vi.fn(),
      delete: vi.fn(),
    },
    groupJoinRequest: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    milestone: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    submission: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    comment: {
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    notification: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    verificationToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
    fileAttachment: {
      create: vi.fn(),
    },
    gitHubRepository: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  }

  return mockPrisma as unknown as typeof import("@/lib/prisma").prisma
}

export function resetMockPrisma(mockPrisma: ReturnType<typeof createMockPrisma>) {
  for (const model of Object.values(mockPrisma as unknown as Record<string, Record<string, unknown>>)) {
    if (model && typeof model === "object") {
      for (const method of Object.values(model)) {
        if (typeof method === "function" && "mockReset" in method) {
          ;(method as ReturnType<typeof vi.fn>).mockReset()
        }
      }
    }
  }
}
