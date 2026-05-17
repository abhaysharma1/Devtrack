# DevTrack - Software Project Management System

A full-stack web application designed to manage student software projects, track progress through milestones, and evaluate student work. It provides role-based dashboards for administrators, teachers, and students within an academic setting.

## Features

- **Role-Based Access Control (RBAC)**: Admin, Teacher, and Student dashboards
- **Project Management**: Create, track, and manage software projects with status workflows
- **Milestone & Submission System**: Weighted milestone tracking with grading and feedback
- **Class & Group Management**: Class enrollment, group creation, and team collaboration
- **GitHub Integration**: Repository linking and commit activity monitoring
- **Notifications System**: Real-time notifications for submissions, approvals, and deadlines
- **Activity & Audit Logging**: Comprehensive tracking of project and system activities
- **Comments System**: Threaded discussions on projects
- **File Attachments**: Upload deliverables and supporting documents
- **Rich Animations**: Polished UI with GSAP, Lenis smooth scrolling, and 3D effects

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI Library | React 19 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database ORM | Prisma 6 |
| Database | SQLite (dev), PostgreSQL (production) |
| Authentication | NextAuth.js 5 |
| Validation | Zod |
| Charts | Recharts |
| Animations | Framer Motion, GSAP, Three.js |
| File Upload | UploadThing |
| Email | Resend |

## Prerequisites

- Node.js (compatible with Next.js 16)
- npm, yarn, pnpm, or bun

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secret-at-least-32-characters"
AUTH_URL="http://localhost:3000"
RESEND_API_KEY="your-resend-api-key"
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
GITHUB_ACCESS_TOKEN="your-github-access-token"
```

### 3. Set Up the Database

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:seed       # Seed with sample data
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Test Accounts

After seeding the database, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@devtrack.edu` | `password123` |
| Teacher | `john.doe@devtrack.edu` | `password123` |
| Teacher | `jane.smith@devtrack.edu` | `password123` |
| Student | `student1@devtrack.edu` - `student20@devtrack.edu` | `password123` |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
devtrack/
├── prisma/
│   ├── schema.prisma          # Database schema (14 models)
│   └── seed.ts                # Database seeding script
├── src/
│   ├── app/
│   │   ├── (landing)/         # Public landing page
│   │   ├── (dashboard)/       # Authenticated dashboards
│   │   │   ├── admin/         # Admin dashboard
│   │   │   ├── teacher/       # Teacher dashboard
│   │   │   └── student/       # Student dashboard
│   │   ├── api/               # REST API routes
│   │   ├── login/             # Login page
│   │   └── register/          # Registration page
│   ├── components/
│   │   ├── animation/         # Animation components
│   │   ├── features/          # Feature-specific components
│   │   ├── landing/           # Landing page sections
│   │   ├── layouts/           # Navbar, sidebar
│   │   ├── providers/         # Context providers
│   │   ├── shared/            # Shared utilities
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Core utilities
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript type definitions
├── middleware.ts              # Auth & role-based routing
└── public/                    # Static assets
```

## Database Schema

The application uses 14 models:

| Model | Purpose |
|-------|---------|
| `User` | Users with roles (ADMIN, TEACHER, STUDENT) |
| `Class` | Academic classes with codes and semesters |
| `ClassMembership` | User-class enrollment |
| `Group` | Student groups within classes |
| `GroupMember` | User-group membership |
| `Project` | Student software projects |
| `Milestone` | Project milestones with weights |
| `MilestoneSubmission` | Submissions with grades |
| `Comment` | Threaded project comments |
| `GitHubRepository` | Linked GitHub repos |
| `FileAttachment` | Uploaded files |
| `Notification` | User notifications |
| `ActivityLog` | Per-project activity tracking |
| `AuditLog` | System-wide audit trail |

## API Endpoints

| Endpoint | Methods | Auth | Description |
|----------|---------|------|-------------|
| `/api/auth/[...nextauth]` | GET, POST | No | NextAuth handlers |
| `/api/auth/register` | POST | No | User registration |
| `/api/classes` | GET, POST | Yes | Class management |
| `/api/projects` | GET, POST | Yes | Project management |
| `/api/groups` | GET, POST | Yes | Group management |
| `/api/milestones` | POST | Yes | Create milestones |
| `/api/milestones/[id]` | PATCH, DELETE | Yes | Update/delete milestones |
| `/api/submissions` | POST, PATCH | Yes | Submit & grade |
| `/api/comments` | GET, POST | Yes | Comment on projects |

## Role-Based Features

### Admin
- Full system oversight and user management
- Analytics and audit logs
- Class and user administration

### Teacher
- Create and manage classes
- Assign projects and create milestones
- Review and grade submissions
- Manage groups and view analytics

### Student
- Create and manage projects
- Submit milestone deliverables
- Participate in groups
- Track progress and view feedback

## Production Deployment

### Database

For production, switch from SQLite to PostgreSQL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/devtrack"
```

### Build

```bash
npm run build
npm run start
```

### Environment Variables

Ensure all required environment variables are set in production:

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - JWT signing secret (32+ characters)
- `AUTH_URL` - Production URL (e.g., `https://yourdomain.com`)
- `RESEND_API_KEY` - Email service API key
- `UPLOADTHING_SECRET` & `UPLOADTHING_APP_ID` - File upload service
- `GITHUB_ACCESS_TOKEN` - GitHub API access

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
