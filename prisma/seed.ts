import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Clean existing data in reverse dependency order
  await prisma.auditLog.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.milestoneSubmission.deleteMany()
  await prisma.milestone.deleteMany()
  await prisma.gitHubRepository.deleteMany()
  await prisma.fileAttachment.deleteMany()
  await prisma.project.deleteMany()
  await prisma.groupMember.deleteMany()
  await prisma.group.deleteMany()
  await prisma.classMembership.deleteMany()
  await prisma.class.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.verificationToken.deleteMany()

  console.log("Cleaned existing data")

  const password = await bcrypt.hash("password123", 12)

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@devtrack.edu",
      name: "System Admin",
      passwordHash: password,
      role: "ADMIN",
      department: "Administration",
    },
  })
  console.log("Created admin:", admin.email)

  // Teachers
  const teacher1 = await prisma.user.create({
    data: {
      email: "john.doe@devtrack.edu",
      name: "Dr. John Doe",
      passwordHash: password,
      role: "TEACHER",
      department: "Computer Science",
      studentId: "TCH001",
    },
  })

  const teacher2 = await prisma.user.create({
    data: {
      email: "jane.smith@devtrack.edu",
      name: "Prof. Jane Smith",
      passwordHash: password,
      role: "TEACHER",
      department: "Software Engineering",
      studentId: "TCH002",
    },
  })
  console.log("Created teachers")

  // Students
  const studentNames = [
    "Alice Johnson", "Bob Williams", "Charlie Brown", "Diana Miller",
    "Eve Davis", "Frank Wilson", "Grace Moore", "Henry Taylor",
    "Ivy Anderson", "Jack Thomas", "Karen Jackson", "Leo White",
    "Mia Harris", "Noah Martin", "Olivia Thompson", "Peter Garcia",
    "Quinn Martinez", "Ryan Robinson", "Sophia Clark", "Thomas Lewis",
  ]

  const students = await Promise.all(
    studentNames.map((name, i) =>
      prisma.user.create({
        data: {
          email: `student${i + 1}@devtrack.edu`,
          name,
          passwordHash: password,
          role: "STUDENT",
          studentId: `STU${String(i + 1).padStart(4, "0")}`,
          department: "Computer Science",
          batch: "2024-2028",
        },
      })
    )
  )
  console.log(`Created ${students.length} students`)

  // Classes
  const class1 = await prisma.class.create({
    data: {
      name: "Software Engineering Project",
      code: "CS-401-SPRING-2026",
      description: "Capstone software engineering project course. Students work in teams to build a full-stack application.",
      section: "A",
      semester: "Spring",
      year: 2026,
      creatorId: teacher1.id,
      teacherId: teacher1.id,
    },
  })

  const class2 = await prisma.class.create({
    data: {
      name: "Web Development Fundamentals",
      code: "CS-301-SPRING-2026",
      description: "Introduction to web development with modern frameworks.",
      section: "B",
      semester: "Spring",
      year: 2026,
      creatorId: teacher1.id,
      teacherId: teacher1.id,
    },
  })

  const class3 = await prisma.class.create({
    data: {
      name: "Database Systems Project",
      code: "CS-402-SPRING-2026",
      description: "Advanced database design and implementation project.",
      section: "A",
      semester: "Spring",
      year: 2026,
      creatorId: teacher2.id,
      teacherId: teacher2.id,
    },
  })
  console.log("Created classes")

  // Enroll students in classes
  for (let i = 0; i < 10; i++) {
    await prisma.classMembership.create({
      data: { classId: class1.id, userId: students[i].id, role: "STUDENT" },
    })
    await prisma.classMembership.create({
      data: { classId: class2.id, userId: students[i + 10 > 19 ? i - 10 : i + 10].id, role: "STUDENT" },
    })
    await prisma.classMembership.create({
      data: { classId: class3.id, userId: students[i].id, role: "STUDENT" },
    })
  }
  console.log("Enrolled students in classes")

  // Groups
  const groupData = [
    { name: "Team Alpha", members: [students[0], students[1], students[2]] },
    { name: "Team Beta", members: [students[3], students[4], students[5]] },
    { name: "Team Gamma", members: [students[6], students[7], students[8]] },
    { name: "Team Delta", members: [students[9], students[10], students[11]] },
  ]

  for (const g of groupData) {
    const group = await prisma.group.create({
      data: {
        name: g.name,
        classId: class1.id,
        maxSize: 4,
        creatorId: teacher1.id,
      },
    })

    for (const member of g.members) {
      await prisma.groupMember.create({
        data: { groupId: group.id, userId: member.id, role: "member" },
      })
    }
  }
  console.log("Created groups")

  // Projects
  const projectTitles = [
    "E-Commerce Platform", "Task Management System", "Social Media Dashboard",
    "Online Learning Portal", "Real-time Chat Application",
  ]

  const projects = await Promise.all(
    projectTitles.map((title, i) =>
      prisma.project.create({
        data: {
          title,
          description: `A comprehensive ${title.toLowerCase()} built with modern web technologies.`,
          techStack: JSON.stringify(["React", "Node.js", "PostgreSQL", "TypeScript"]),
          status: i < 3 ? "IN_PROGRESS" : "PLANNED",
          priority: i === 0 ? "high" : "medium",
          completionPct: [45, 70, 20, 0, 0][i],
          ownerId: students[i].id,
          classId: class1.id,
          tags: JSON.stringify(["web", "fullstack", "academic"]),
          dueDate: new Date(2026, 5, 30 + i * 7),
          repoUrl: `https://github.com/devtrack-org/${title.toLowerCase().replace(/\s+/g, "-")}`,
        },
      })
    )
  )

  // Link group to first project
  const firstGroup = await prisma.group.findFirst({ where: { classId: class1.id } })
  if (firstGroup) {
    await prisma.group.update({
      where: { id: firstGroup.id },
      data: { projectId: projects[0].id },
    })
  }
  console.log("Created projects")

  // Milestones
  const milestoneTemplates = [
    { title: "Project Proposal", order: 1, weight: 1 },
    { title: "Requirements Document", order: 2, weight: 2 },
    { title: "UI/UX Design", order: 3, weight: 2 },
    { title: "Core Backend Implementation", order: 4, weight: 3 },
    { title: "Frontend Implementation", order: 5, weight: 3 },
    { title: "Integration & Testing", order: 6, weight: 2 },
    { title: "Final Presentation", order: 7, weight: 2 },
  ]

  for (const project of projects) {
    let completedCount = 0
    for (const mt of milestoneTemplates) {
      const isCompleted = mt.order <= 3 && project.status !== "PLANNED"
      const status = isCompleted ? "APPROVED" : mt.order === 4 && project.status === "IN_PROGRESS" ? "IN_PROGRESS" : "PENDING"

      const milestone = await prisma.milestone.create({
        data: {
          title: `${project.title} - ${mt.title}`,
          description: `Complete the ${mt.title.toLowerCase()} phase for ${project.title}.`,
          projectId: project.id,
          status,
          order: mt.order,
          weight: mt.weight,
          dueDate: new Date(2026, 3 + Math.floor(mt.order / 2), 15 + mt.order * 10),
          completedAt: isCompleted ? new Date(2026, 2 + Math.floor(mt.order / 2), 10 + mt.order * 8) : null,
        },
      })

      if (isCompleted) {
        completedCount++
        await prisma.milestoneSubmission.create({
          data: {
            milestoneId: milestone.id,
            userId: project.ownerId,
            content: `Delivered all requirements for ${mt.title.toLowerCase()}.`,
            grade: 85 + Math.floor(Math.random() * 15),
            feedback: "Good work! Consider adding more detail next time.",
          },
        })
      }
    }
  }
  console.log("Created milestones")

  // Activity logs
  for (const project of projects) {
    await prisma.activityLog.create({
      data: {
        type: "PROJECT_CREATED",
        description: "created a new project",
        projectId: project.id,
        userId: project.ownerId,
      },
    })
    await prisma.activityLog.create({
      data: {
        type: "STATUS_CHANGED",
        description: "updated project status to " + project.status.replace("_", " "),
        projectId: project.id,
        userId: project.ownerId,
      },
    })
  }
  console.log("Created activity logs")

  // Notifications
  for (const project of projects) {
    await prisma.notification.create({
      data: {
        type: "STATUS_CHANGE",
        title: "Project Created",
        message: `Your project "${project.title}" has been created successfully.`,
        recipientId: project.ownerId,
      },
    })
  }

  await prisma.notification.create({
    data: {
      type: "DEADLINE_REMINDER",
      title: "Upcoming Deadline",
      message: "Project Proposal milestone is due in 3 days.",
      recipientId: students[3].id,
    },
  })
  console.log("Created notifications")

  // Comments
  await prisma.comment.create({
    data: {
      content: "Great progress on the backend! Let me know if you need help with authentication.",
      projectId: projects[0].id,
      userId: teacher1.id,
    },
  })

  await prisma.comment.create({
    data: {
      content: "Thanks! We're implementing JWT-based auth now.",
      projectId: projects[0].id,
      userId: students[0].id,
      parentId: null,
    },
  })
  console.log("Created comments")

  // GitHub repos
  for (const project of projects) {
    if (project.repoUrl) {
      const repoName = project.repoUrl.replace("https://github.com/", "")
      await prisma.gitHubRepository.create({
        data: {
          projectId: project.id,
          fullName: repoName,
          url: project.repoUrl,
          lastCommitSha: "abc123def456",
          lastCommitMsg: "Initial project setup with build configuration",
          lastCommitAt: new Date(2026, 2, 10),
          contributorCount: 3,
          commitCount7d: 15,
        },
      })
    }
  }
  console.log("Created GitHub repositories")

  // Audit logs
  await prisma.auditLog.create({
    data: {
      action: "SYSTEM_SEEDED",
      entityType: "system",
      entityId: "seed",
      actorId: admin.id,
      metadata: JSON.stringify({ seededAt: new Date().toISOString() }),
    },
  })
  console.log("Created audit logs")

  console.log("\n✅ Seed complete!")
  console.log("\n📋 Test Accounts:")
  console.log("   Admin:  admin@devtrack.edu / password123")
  console.log("   Teacher: john.doe@devtrack.edu / password123")
  console.log("   Teacher: jane.smith@devtrack.edu / password123")
  console.log("   Student: student1@devtrack.edu / password123 (through student20)")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
