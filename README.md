# Madrasa Management System Documentation

## 1. Introduction

This repository implements a comprehensive **Madrasa Management System** built with Next.js, designed to streamline administrative, academic, and attendance operations within a madrasa. It provides modules for managing students, teachers, classes, subjects, timetables, attendance, departments, and user authentication.

---

## 2. System Overview

### Purpose
To facilitate efficient management of madrasa activities, including student enrollment, teacher administration, class scheduling, attendance tracking, and departmental organization.

### Target Users
- Admin staff
- Teachers (lecturers)
- Department heads
- System administrators

### Core Features
- User authentication and role-based access
- Student management (add, edit, delete, list)
- Teacher (lecturer) management
- Department and class management
- Subject management
- Timetable scheduling
- Attendance recording and viewing
- Islamic calendar (Hijri date display)
- CSV bulk upload for students
- Dynamic dashboards and reports

---

## 3. Features & Functionalities

### Authentication
- Login, logout, and session management (`/api/auth/login`, `/api/auth/logout`, `/api/auth/me`)
- Role-based access control (Admin, Lecturer, Student)

### User Management
- Admin can add/edit/delete lecturers, students, departments, classes, subjects
- Role assignment and profile management

### Student Management
- CRUD operations for student records
- Enrollment in classes
- Bulk CSV upload for mass enrollment
- Student details view and edit

### Lecturer Management
- CRUD for lecturers
- Qualifications and language skills management
- Credential generation for login

### Department & Class Management
- Add, edit, delete departments and classes
- Class capacity and status tracking
- Department-specific class filtering

### Subject Management
- CRUD for subjects
- Assign subjects to timetable slots

### Timetable Scheduling
- Create, edit, delete timetable entries
- Assign subjects, lecturers, and time slots
- Weekly timetable view grouped by days

### Attendance
- Mark attendance per class and date
- View attendance records
- Attendance summary and reports

### Calendar
- Islamic Hijri calendar with events
- Date navigation and selection

### Miscellaneous
- Dashboard with key metrics (students, classes, lecturers, subjects, departments)
- Notifications and alerts
- Responsive UI with Tailwind CSS

---

## 4. Folder Structure & Organization

```plaintext
.
├── app/                         # Next.js app directory
│   ├── (dashboard)/            # Dashboard modules
│   │   ├── admin/                # Admin panel pages
│   │   │   ├── layout.tsx        # Layout for admin pages
│   │   │   ├── page.tsx          # Dashboard overview
│   │   │   ├── calendar/         # Calendar module
│   │   │   │   └── hijri-calendar.tsx
│   │   │   ├── classes/          # Class management
│   │   │   ├── departments/      # Department management
│   │   │   ├── subjects/         # Subject management
│   │   │   ├── timetable/        # Timetable scheduling
│   │   │   ├── attendance/       # Attendance tracking
│   │   │   └── ...               # Other admin features
│   │   ├── lecturer/             # Lecturer-specific pages
│   │   └── ...                     # Other user roles
│   ├── page.tsx                   # Main landing page
│   └── layout.tsx                 # Global layout
├── components/                   # Reusable UI components
│   ├── layout/                   # Header, Sidebar, etc.
│   ├── ui/                       # Buttons, inputs, cards, badges
│   └── ...                       # Other components
├── lib/                          # Utility functions and types
│   ├── auth.ts                   # Authentication helpers
│   ├── supabase/                 # Supabase client setup
│   └── types.ts                  # Type definitions
├── middleware.ts                 # Middleware for auth/session
├── pages/                        # Legacy or API routes
│   ├── api/                      # API route handlers
│   │   ├── auth/                 # Auth APIs
│   │   ├── classes/              # Class APIs
│   │   ├── departments/          # Department APIs
│   │   ├── lecturers/            # Lecturer APIs
│   │   ├── students/             # Student APIs
│   │   ├── subjects/             # Subject APIs
│   │   ├── timetable/            # Timetable APIs
│   │   └── ...                   # Other APIs
│   └── ...                       # Other pages
├── public/                       # Static assets (images, icons)
├── styles/                       # CSS, Tailwind configs
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

---

## 5. Architecture & Design

### Frontend
- Built with Next.js 13+ using the App Directory (`app/`)
- React components with hooks for state and effects
- Tailwind CSS for styling
- Role-based pages and layouts
- Client components (`'use client'`) for interactivity

### Backend
- API routes under `/api/` for CRUD operations
- Uses Supabase as the backend database
- Authentication via custom API (`auth/`) with session management
- Data validation and error handling in API handlers

### Data Flow
- User interacts with UI components
- API calls are made to `/api/` endpoints
- Server-side handlers process requests, interact with Supabase
- Responses update the UI via React state

### Security
- Role-based access control
- Session management with secure cookies
- Validation on both client and server sides

---

## 6. Technologies & Dependencies

- **Next.js 13+** (React framework)
- **Tailwind CSS** (Styling)
- **Supabase** (Backend database and auth)
- **Lucide-react** (Icons)
- **TypeScript** (Type safety)
- **React hooks** for state management
- **API routes** for server-side logic

---

## 7. Setup & Deployment

### Prerequisites
- Node.js v16+ installed
- Supabase project with relevant tables
- Environment variables for Supabase credentials

### Setup
```bash
git clone <repo-url>
cd madrasa-management-system
npm install
```

### Development
```bash
npm run dev
# Visit http://localhost:3000
```

### Production
- Build with `npm run build`
- Deploy on Vercel or similar platform
- Set environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, etc.)

---

## 8. Future Enhancements
- Role-based UI customization
- Notification system
- Attendance analytics and reports
- Multi-language support
- Mobile app integration

---

## 9. Summary

This repository provides a full-featured **Madrasa Management System** with a modular, scalable architecture. It leverages Next.js for SSR/SSG, Supabase for backend, and Tailwind for styling, ensuring a modern, maintainable codebase suitable for educational institutions.

---

## 10. References
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Lucide Icons](https://lucide.dev/)

---

**Note:** This documentation is based solely on the provided code snippets and folder structure. For detailed API schemas, database schemas, and deployment instructions, further exploration of the codebase and environment setup is recommended.
