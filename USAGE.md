# DevTrack Usage Guide

This document provides detailed instructions on how to use the Software Project Management System (DevTrack).

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Admin Guide](#admin-guide)
- [Teacher Guide](#teacher-guide)
- [Student Guide](#student-guide)
- [Notifications](#notifications)
- [Profile & Settings](#profile--settings)

---

## Getting Started

### First-Time Setup

1. Navigate to the application URL
2. Click **Register** to create an account, or use a pre-seeded test account
3. Log in with your credentials
4. You will be redirected to your role-specific dashboard

### Registration

1. Click **Register** on the login page
2. Fill in the required fields:
   - Full Name
   - Email (must be unique)
   - Password (minimum 8 characters)
   - Role (Student or Teacher - Admin is pre-seeded)
3. Click **Sign Up**
4. Log in with your new credentials

---

## Authentication

### Login

1. Navigate to `/login`
2. Enter your email and password
3. Click **Sign In**
4. You will be redirected based on your role:
   - Admin → `/admin`
   - Teacher → `/teacher`
   - Student → `/student`

### Logout

1. Click your avatar/name in the navbar
2. Select **Logout** from the dropdown
3. You will be redirected to the login page

### Password Recovery

1. Click **Forgot Password** on the login page
2. Enter your registered email
3. Check your inbox for a password reset link
4. Follow the link to set a new password

---

## Admin Guide

### Dashboard Overview

The admin dashboard provides a high-level view of system metrics:

- Total users (admins, teachers, students)
- Active classes and projects
- Recent activity and audit logs
- System health indicators

### User Management

**View Users**
1. Navigate to **Admin → Users**
2. Browse the user list with filters for role, status, and search

**Create User**
1. Click **Add User**
2. Fill in user details (name, email, role, password)
3. Click **Create**

**Edit User**
1. Find the user in the list
2. Click the **Edit** action
3. Update fields and save

**Delete User**
1. Find the user in the list
2. Click the **Delete** action
3. Confirm deletion

### Class Management

1. Navigate to **Admin → Classes**
2. View all classes across the system
3. Create, edit, or delete classes as needed
4. Assign teachers and students to classes

### Analytics

1. Navigate to **Admin → Analytics**
2. View system-wide metrics:
   - User growth over time
   - Project completion rates
   - Class enrollment statistics
   - Activity trends

### Audit Logs

1. Navigate to **Admin → Logs**
2. View system-wide audit trail
3. Filter by:
   - User
   - Action type
   - Date range
   - Resource type

---

## Teacher Guide

### Dashboard Overview

The teacher dashboard shows:

- Classes you teach
- Assigned projects and their status
- Pending submissions to review
- Upcoming milestone deadlines

### Managing Classes

**Create a Class**
1. Navigate to **Teacher → Classes**
2. Click **Create Class**
3. Fill in:
   - Class Name
   - Class Code (auto-generated or custom)
   - Semester (e.g., "Fall 2026")
   - Year
4. Click **Create**

**Enroll Students**
1. Open a class detail view
2. Click **Enroll Students**
3. Select students from the list or provide enrollment codes
4. Students can also join using the class code

**Manage Class**
- View enrolled students
- Create and manage groups
- Assign projects to the class

### Managing Projects

**View Projects**
1. Navigate to **Teacher → Projects**
2. Filter by class, status, or student
3. Click a project to view details

**Create Milestones**
1. Open a project detail view
2. Click **Add Milestone**
3. Fill in:
   - Title
   - Description
   - Order (sequence number)
   - Weight (percentage contribution to final grade)
   - Due Date
4. Click **Create**

**Review Submissions**
1. Navigate to the project or submissions list
2. Click on a pending submission
3. Review the submitted content and attachments
4. Assign a grade (0-100)
5. Provide feedback
6. Click **Submit Grade**
   - Grades >= 50 are auto-approved
   - Grades < 50 are auto-rejected

### Managing Groups

**Create a Group**
1. Navigate to **Teacher → Groups**
2. Click **Create Group**
3. Fill in:
   - Group Name
   - Class
   - Maximum Size
4. Click **Create**

**Add Members**
1. Open a group detail view
2. Click **Add Members**
3. Select students from the class
4. Click **Add**

### Analytics

1. Navigate to **Teacher → Analytics**
2. View class-specific metrics:
   - Project completion rates
   - Grade distributions
   - Milestone progress
   - Student performance

---

## Student Guide

### Dashboard Overview

The student dashboard shows:

- Your active projects
- Upcoming milestone deadlines
- Recent feedback and grades
- Group memberships

### Managing Projects

**Create a Project**
1. Navigate to **Student → Projects**
2. Click **Create Project**
3. Fill in:
   - Title
   - Description
   - Tech Stack (comma-separated or tags)
   - Repository URL (optional)
   - Live URL (optional)
   - Class (if applicable)
   - Group (if applicable)
4. Click **Create**

**Edit Project**
1. Open your project detail view
2. Click **Edit**
3. Update fields and save

**Update Project Status**
- Projects follow a workflow: `PLANNED` → `IN_PROGRESS` → `COMPLETED`
- Change status from the project detail view

### Milestone Submissions

**Submit a Milestone**
1. Open your project detail view
2. Find the milestone to submit
3. Click **Submit**
4. Fill in:
   - Submission Content (description, links, etc.)
   - Notes (optional)
   - Attachments (optional, max 4MB)
5. Click **Submit**

**View Submission Status**
- **Pending**: Awaiting teacher review
- **Approved**: Grade >= 50
- **Rejected**: Grade < 50 (review feedback and resubmit)

**View Grades and Feedback**
1. Open the submission detail
2. View your grade (0-100)
3. Read teacher feedback
4. Use feedback to improve future submissions

### Project Completion

- Completion percentage is calculated automatically based on:
  - Milestone weights
  - Submission grades
- Formula: `Sum of (milestone_weight * grade / 100)` for all approved submissions

### Group Participation

**View Groups**
1. Navigate to **Student → Groups**
2. See your group memberships
3. View group members and linked projects

**Collaborate**
- Coordinate with group members on shared projects
- Submit milestone deliverables as a team

### Comments

**Add a Comment**
1. Open a project detail view
2. Scroll to the comments section
3. Type your comment
4. Click **Post**

**Reply to Comments**
1. Find the comment to reply to
2. Click **Reply**
3. Type your response
4. Click **Post**

---

## Notifications

### Notification Center

1. Click the bell icon in the navbar
2. View all notifications sorted by date
3. Notifications include:
   - New comments on your projects
   - Submission status changes (approved/rejected)
   - Upcoming milestone deadlines
   - System announcements

### Mark as Read

1. Click a notification to mark it as read
2. Or use **Mark All as Read** to clear all unread notifications

### Notification Settings

- Configure notification preferences in **Settings → Notifications**
- Choose which events trigger notifications

---

## Profile & Settings

### View Profile

1. Click your avatar/name in the navbar
2. Select **Profile**
3. View your:
   - Name and email
   - Role
   - Account creation date
   - Activity summary

### Edit Profile

1. Navigate to **Settings**
2. Update:
   - Display Name
   - Avatar
   - Contact Information
3. Click **Save**

### Change Password

1. Navigate to **Settings → Security**
2. Enter current password
3. Enter new password
4. Confirm new password
5. Click **Update Password**

### Theme Preferences

1. Navigate to **Settings → Appearance**
2. Choose theme:
   - Light
   - Dark
   - System (follows OS preference)
3. Preferences are saved automatically

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` / `Cmd + K` | Open command palette |
| `Ctrl + /` | Show keyboard shortcuts |
| `Esc` | Close modals/dialogs |

---

## Troubleshooting

### Common Issues

**Cannot log in**
- Verify email and password are correct
- Use "Forgot Password" if needed
- Contact admin if account is locked

**File upload fails**
- Check file size (max 4MB)
- Verify file type is supported
- Ensure UploadThing is configured correctly

**Submission not visible to teacher**
- Verify submission status is "Submitted"
- Check that the project is linked to the correct class
- Contact teacher if issue persists

**Grade not updating completion percentage**
- Completion recalculates automatically after grading
- Refresh the page if changes don't appear
- Verify milestone weights sum to 100%

### Getting Help

- Contact your system administrator
- Check the audit logs for error details
- Review browser console for client-side errors
