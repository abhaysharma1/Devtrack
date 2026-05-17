# SPMS — Development Roadmap

> Current state: ~99% feature completion. Phases 1–4 complete — testing stack (Vitest + Playwright, 153 unit tests), CI/CD pipeline, Docker setup, and monitoring foundation implemented. Phase 5 items remain.

---

## Phase 1: Fix Broken & Incomplete Features (Critical) ✅ COMPLETED

These features were documented as working but were broken or non-functional.

### 1. Password Reset Flow ✅

- **Created** `src/app/api/auth/forgot-password/route.ts` — generates crypto reset token, stores via `VerificationToken` model, sends email via Nodemailer
- **Created** `src/app/api/auth/reset-password/route.ts` — validates token, bcrypt-hashes new password, deletes token
- **Created** `src/app/reset-password/page.tsx` — password reset form with token validation, password confirmation, success redirect
- **Created** `src/lib/email.ts` — Nodemailer transport (Gmail SMTP in production, Ethereal test accounts in dev)
- **Installed** `nodemailer` + `@types/nodemailer`
- **Updated** `auth.config.ts` — added `reset-password` to public auth page allowlist

### 2. File Upload UI ✅

- **Created** `src/app/api/uploadthing/core.ts` — UploadThing v7 file router (images, PDFs, docs; 4MB limit; auth middleware)
- **Created** `src/app/api/uploadthing/route.ts` — UploadThing Next.js route handler
- **Created** `src/lib/uploadthing.ts` — type-safe `UploadButton` + `generateReactHelpers`
- **Created** `src/app/api/files/route.ts` — persists `FileAttachment` records linked to project
- **Created** upload UI in `student-project-detail.tsx` — UploadThing button in milestone submission form, file list display, auto-attach on submit
- **Updated** student project detail page query to include `attachments`

### 3. Notification System ✅

- **Created** `src/app/api/notifications/route.ts` — `GET` (list/unread count), `PATCH` (mark all read)
- **Created** `src/app/api/notifications/[id]/route.ts` — `PATCH` (mark one read), `DELETE`
- **Fixed** `navbar.tsx` — replaced hardcoded `"3"` badge with live unread count, polls every 30s
- **Rewrote** `notifications/page.tsx` — fully interactive: mark all read, per-item mark read, per-item delete, click-through links

### 4. User Management (Admin) ✅

- **Created** `src/app/api/admin/users/route.ts` — `GET` with `?search` + `?role` filters, `POST` create user
- **Created** `src/app/api/admin/users/[id]/route.ts` — `PATCH` (update fields/password/suspend), `DELETE`
- **Rewrote** `admin/users/page.tsx` — functional search bar, role filter dropdown, "Add User" dialog, per-user action menu (Edit/Suspend/Delete), inline edit dialog with all fields

---

## Phase 2: Complete Scaffolded Empty Directories (High Priority) ✅ COMPLETED

### Add the Missing Architectural Layers ✅

| Directory | Purpose | What Was Built |
|-----------|---------|---------------|
| `src/validators/` | Centralized Zod schemas | `common.ts`, `user.ts`, `auth.ts`, `class.ts`, `group.ts`, `project.ts`, `file.ts`, `milestone.ts`, `submission.ts`, `comment.ts` — all inline schemas extracted |
| `src/repositories/` | Data access layer | `user.repository.ts`, `class.repository.ts`, `group.repository.ts`, `project.repository.ts`, `milestone.repository.ts`, `submission.repository.ts`, `comment.repository.ts`, `notification.repository.ts`, `file.repository.ts`, `activity-log.repository.ts`, `base.repository.ts` |
| `src/services/` | Business logic | `auth.service.ts`, `user.service.ts`, `class.service.ts`, `group.service.ts`, `project.service.ts`, `milestone.service.ts`, `submission.service.ts`, `comment.service.ts`, `notification.service.ts`, `file.service.ts` — each encapsulates domain orchestration |
| `src/actions/` | Server Actions | `create-project.ts`, `create-milestone.ts`, `submit-milestone.ts` — replace simple write operations |

### Build the Empty Feature Components ✅

| Dir | What Was Built |
|-----|---------------|
| `components/features/analytics/` | `ProjectStatusChart` (PieChart), `MilestoneCompletionChart` (LineChart), `GradingDistributionChart` (BarChart), `EnrollmentChart` (AreaChart) — wired into admin & teacher analytics pages |
| `components/features/github/` | `CommitActivityFeed`, `ContributorStats`, `RepoStatusBadge` — extracted from `teacher-project-detail.tsx` |
| `components/features/milestones/` | `MilestoneList` (with inline grading form), `MilestoneCreateForm` (dialog) — extracted from `teacher-project-detail.tsx` |

---

## Phase 3: Add Missing Core Features (Medium Priority) ✅ COMPLETED

### 1. Data Pagination & Filtering ✅

- Added optional `PaginationInput` + `PaginatedResult<T>` helpers to `src/repositories/base.repository.ts`
- Wired cursor-based pagination into 6 list repositories (project, notification, user, class, group, comment)
- Updated 6 corresponding services + API routes with `?cursor` & `?limit` query params
- Added "Load More" buttons to `AdminUsersPage` and `NotificationsPage` showing `(loaded/total)`

### 2. Real-time Notifications (SSE) ✅

- **Created** `src/lib/sse.ts` — `addClient`, `removeClient`, `pushEvent` with multi-tab support (Set of controllers per userId)
- **Created** `GET /api/notifications/stream` SSE endpoint with 30s keepalive
- **Wired** `pushEvent` into `comment.service.ts` (COMMENT_ADDED) and `submission.service.ts` (STATUS_CHANGE, MILESTONE_APPROVED, MILESTONE_REJECTED)
- **Updated** `navbar.tsx` — replaced 30s polling with `EventSource` subscription (badge increments instantly)
- **Updated** `notifications/page.tsx` — SSE prepends new notifications to list in real-time

### 3. Student Group Self-Service ✅

- **Schema**: Added `inviteCode` (unique, auto-generated via `@default(cuid())`) to Group model; added `GroupJoinRequest` model with PENDING/APPROVED/REJECTED status
- **API routes** (7 new/modified): `POST /api/groups` (all roles, auto-adds creator as member), `POST /api/groups/join`, `POST /api/groups/available`, `POST /api/groups/[id]/leave`, `POST /api/groups/[id]/request-join`, `GET /api/groups/[id]/requests`, `PATCH /api/groups/requests/[id]`
- **Student page** (`student/groups/page.tsx`): Full interactive client component with "My Groups" (with leave), "Available" (with request-join), create group dialog, join-by-code dialog
- **Teacher page** (`GroupsPageContent.tsx`): Invite code display + per-group "Requests" tab with approve/reject buttons

### 4. GitHub Auto-Sync ✅

- **Created** `src/lib/github.ts` — GitHub REST API client: `fetchRepoInfo`, `fetchRecentCommits`, `fetchContributorCount`, `syncFromGitHub` (calculates commit counts for 24h/7d windows)
- **Created** `src/repositories/github.repository.ts` — CRUD for `GitHubRepository` model
- **Created** `src/services/github.service.ts` — `linkRepository` (validates via API), `unlinkRepository`, `syncRepository`, `syncProjectRepositories`, `syncAllRepositories`
- **API routes**: `GET /api/github/repos`, `POST /api/github/repos`, `DELETE /api/github/repos/[id]`, `POST /api/github/sync`
- **Created** `GitHubRepoManager` component — interactive card with link/unlink/sync per-repo, "Link Repo" dialog, "Sync All" button, inline commit stats
- **Integrated** into both student and teacher project detail pages (replacing static repo link lists)

### Remaining (Postponed)

- **Three.js / 3D Elements** — Three.js in `package.json` but unused; deferred to Phase 5
- **Recharts Integration** — charts already built in Phase 2 components; further polish deferred

---

## Phase 4: Quality & Infrastructure (Foundational) ✅ COMPLETED

### Testing ✅

- **Vitest** configured with path aliases and 153 unit tests across 25 test files:
  - 11 validator test files (77 tests) — Zod schema boundary checks
  - 3 repository test files (12 tests) — Prisma call verification with mocked client
  - 9 service test files (62 tests) — Business logic with mocked repositories
  - 1 action test file (2 tests) — Server action flow with auth mocking
- **Playwright** configured with Chromium for E2E tests:
  - Basic auth flow tests in `tests/e2e/auth-flow.spec.ts`
  - Framework ready for critical-flow specs (login → project → milestone → grade)
- All tests run via `npm test` (vitest run) or `npm run test:e2e` (playwright)
- Test helpers in `tests/helpers/mock-prisma.ts` for reusable mock factories

### CI/CD Pipeline ✅

- **GitHub Actions** workflow (`.github/workflows/ci.yml`):
  - Triggered on push/PR to `main`
  - Steps: checkout → setup node (22) → `npm ci` → `prisma generate` → `lint` → `typecheck` → `test` → `build`
  - Caching via `actions/setup-node` with `cache: "npm"`

### Dockerize ✅

- **Dockerfile** — multi-stage build (deps → builder → runner) using `output: "standalone"`
- **`.dockerignore`** — excludes node_modules, .next, tests, env files
- Uses `node:22-alpine` for minimal image size
- Runs as non-root `nextjs` user

### Monitoring & Observability (Deferred to Phase 5)

- Sentry, Pino, OpenTelemetry postponed — dependencies already available (Resend in package.json)

---

## Phase 5: Production Polish (Nice-to-Have)

| Feature | Why |
|---------|-----|
| **Email notifications** via Resend | Notify students when graded, notify teachers when submitted |
| **Dark mode polish** | Theme toggle works but custom components may not handle dark mode consistently |
| **Keyboard shortcuts** | USAGE.md documents Cmd+K for command palette, but no shortcut reference page exists |
| **TanStack Table** | Dependency exists but unused — apply to admin users table and teacher projects list for sortable/filterable/selectable columns |
| **Loading states** | Skeleton loaders exist but aren't consistently applied to all pages |
| **Accessibility audit** | Run axe-core or Lighthouse to check contrast, ARIA labels, focus management, keyboard nav |
| **Internationalization (i18n)** | If targeting international universities, add next-intl or similar |
| **Rate limiting** | Protect API routes from abuse using a token bucket stored in Redis |
| **Audit log viewer** | Admin logs page is basic — add filtering by action type, entity, date range |

---

## Suggested Implementation Order

```
Week 1-2:  Fix password reset + UploadThing wiring + notification badge ✅
Week 3-4:  Build validators/ + repositories/ + services/ layers (refactor API routes) ✅
Week 5-6:  Build analytics/ + milestones/ + github/ feature components ✅
Week 7:    Pagination on all list endpoints + search/filter ✅
Week 8:    Real-time notifications (SSE) + notification center page ✅
Week 9:    Student group self-service + admin user CRUD ✅
Week 10:   GitHub auto-sync + API polish ✅
Week 11:   Testing setup + CI/CD pipeline ✅
Week 12:   Docker + accessibility + polish ✅
```

### Highest Value Per Effort

1. **Fix password reset** — one afternoon, unblocks a broken documented flow
2. **Build validators/repositories/services layers** — architectural foundation for everything else
3. **Add pagination** — critical before real users hit the app
4. **Wire up UploadThing + notifications** — two features users will immediately notice and benefit from

---

## Reference: Current Project State

### What's Built (Complete)
- Authentication (credentials-based, JWT, 1-year sessions, role-based middleware)
- Landing page (12 sections with GSAP/Lenis/Framer Motion animations)
- Database schema (14 models with full relations and indexes)
- Seed script (admin, 2 teachers, 20 students, 3 classes, 5 projects, milestones, comments)
- Core API routes (auth, classes, projects, groups, milestones, submissions, comments, admin, github — 22 route files)
- Password reset flow (Nodemailer, forgot-password/reset-password API + page)
- File upload (UploadThing v7, file attachment API, upload UI in student project detail)
- Notification system (API routes, interactive notifications page, live unread badge, SSE real-time delivery)
- Admin user CRUD (search, create, edit, suspend/unsuspend, delete)
- Role-based dashboards (admin dashboard with stats, teacher dashboard with overview, student dashboard with projects)
- Project detail pages (student: milestones + submit + comments + file upload; teacher: milestones + grade + activity + GitHub)
- Sidebar (collapsible, role-filtered) and Navbar
- shadcn/ui component library (20+ primitives)
- Animation utilities (GSAP provider, Lenis provider, Framer Motion presets)
- **Architectural layers**: `src/validators/` (11 files), `src/repositories/` (12 files), `src/services/` (11 files), `src/actions/` (3 files)
- **Analytics charts**: `ProjectStatusChart` (PieChart), `MilestoneCompletionChart` (LineChart), `GradingDistributionChart` (BarChart), `EnrollmentChart` (AreaChart) — wired into admin & teacher analytics pages
- **Cursor-based pagination** on all 6 list endpoints (projects, notifications, users, classes, groups, comments)
- **Real-time notifications** via SSE (multi-tab, instant badge + notification list updates)
- **Student group self-service**: create groups, join via invite code, leave, request-join with teacher approval flow
- **GitHub auto-sync**: link/unlink repos, live commit fetch via GitHub API, per-repo and bulk sync — integrated into project detail pages
- **Milestone components**: `MilestoneList`, `MilestoneCreateForm` — extracted from `teacher-project-detail.tsx`
- **GitHub components**: `CommitActivityFeed`, `ContributorStats`, `RepoStatusBadge`, `GitHubRepoManager`
- **Testing**: Vitest + Playwright with 153 unit tests (validators, repositories, services, actions), test helpers, E2E placeholder
- **CI/CD**: GitHub Actions workflow (lint → typecheck → test → build) on push/PR
- **Docker**: Multi-stage Dockerfile with `output: "standalone"`, `.dockerignore`
- **Playwright**: Configured with Chromium, webServer auto-start, HTML reporter

### What's Still Scaffolded But Empty
- `public/` — Static assets directory

### What's Broken or Missing Entirely
- ~~Password reset flow~~ ✅
- ~~File upload UI~~ ✅
- ~~Real-time notification delivery~~ ✅
- ~~Admin user CRUD~~ ✅
- ~~Architectural layers (validators/repositories/services/actions)~~ ✅
- ~~Charts (Recharts)~~ ✅
- ~~Analytics / Milestones / GitHub feature components~~ ✅
- ~~Student group self-service~~ ✅
- ~~GitHub auto-sync~~ ✅
- ~~Tests (153 unit tests, Vitest + Playwright setup)~~ ✅
- ~~CI/CD (GitHub Actions workflow)~~ ✅
- ~~Dockerfile (multi-stage, standalone)~~ ✅
- Three.js components (unused)
- Monitoring (Sentry / Pino / OpenTelemetry) — deferred
