# Madrasa System Authentication Note

## Current auth model

This project currently uses a **custom JWT-based session system**, not Supabase Auth as the main application authentication layer.[cite:63] A signed JWT is created in `createSession()`, stored in a `session` cookie, and later read back through `getSession()` for server-side access control and user identification.[cite:63]

Supabase is currently being used mainly as the database access layer through the server client helpers, not as the primary login/session provider for the app.[cite:61][cite:63] The existing Supabase callback route still contains `supabase.auth.exchangeCodeForSession(code)`, which indicates leftover or unused Supabase Auth callback logic unless some active login flow still redirects through it.[cite:61]

## Auth routes

The current auth API routes are:

- `app/api/auth/login/route.ts` — validates user credentials against the `users` table, then creates a custom JWT session cookie containing `userId`, `email`, `role`, and `fullName`.[cite:63]
- `app/api/auth/logout/route.ts` — destroys the custom session cookie.[cite:63]
- `app/api/auth/me/route.ts` — returns the current user session from `getSession()` and responds with 401 when no session exists.[cite:63]
- `app/api/auth/callback/route.ts` — performs Supabase `exchangeCodeForSession(code)` and redirects, which appears separate from the current custom JWT login flow.[cite:61]

The login flow currently queries the `users` table directly by `email`, `password`, and `is_active`, then creates the JWT session after a successful match.[cite:63] That means the application is presently using its own credential verification flow on top of the database, rather than delegated Supabase Auth sign-in.[cite:63]

## Session contents

The JWT-backed session currently includes at least these fields: `userId`, `email`, `role`, and `fullName`.[cite:63] The `role` value is central to the application's authorization model because lecturer/admin access decisions are made from `session.role` in server code.[cite:63]

Middleware currently checks only for the existence of the `session` cookie and does not enforce role-specific routing by itself.[cite:64] This means middleware provides login presence protection, while role enforcement has been moved into layout-level checks for the dashboard sections.[cite:64]

## Route protection status

Role-based route protection has now been added at the layout level for both dashboard sections: admin and lecturer.[cite:63] This is an important improvement because it protects all child pages in each section without repeating the same role guard in every page component.[cite:63]

### Admin section

`app/(dashboard)/admin/layout.tsx` now checks the session on the server, redirects unauthenticated users to `/login`, and redirects non-admin users to `/lecturer`.[cite:63] This prevents lecturers from manually opening admin URLs such as `/admin/students` through direct navigation.[cite:63]

### Lecturer section

`app/(dashboard)/lecturer/layout.tsx` now checks the session on the server, redirects unauthenticated users to `/login`, and redirects non-lecturer users to `/admin`.[cite:63] This protects the lecturer area in the same way and centralizes role enforcement at the route-group layout level.[cite:63]

## Lecturer data scoping

Lecturer-facing pages are already scoped to the logged-in lecturer's own data using the session user ID and lecturer mapping logic.[cite:63] The flow is:

1. Read the session using `getSession()`.[cite:63]
2. Find the current user's `lecturer_id` from the `users` table.[cite:160]
3. Resolve the lecturer row from the `lecturer` table using `old_id`.[cite:160]
4. Query timetable data filtered by that lecturer's identifier.[cite:160]

Because timetable and attendance pages filter by the resolved lecturer identifier, a lecturer currently sees only their own timetable and marks attendance only for students tied to the selected class from that lecturer's timetable.[cite:160] This is data scoping logic, which is separate from route protection but works together with it.[cite:160]

## Day-of-week mapping

The lecturer timetable and attendance logic uses this pattern:

```ts
const jsDay = new Date().getDay()
const today = jsDay === 0 ? 6 : jsDay - 1
```

JavaScript `getDay()` returns `0` for Sunday through `6` for Saturday.[cite:174] The project converts that into a Monday-first index where Monday becomes `0` and Sunday becomes `6`, which matches the timetable table's day numbering scheme used by lecturer timetable and attendance queries.[cite:174]

This mapping is not a security concern; it is a scheduling/data-alignment detail.[cite:174]

## Current API security status

Although page and layout route protection is now in place, most business API routes shown so far do not yet enforce session and role checks at the route-handler level.[cite:160][cite:63] That means page navigation is better protected, but sensitive server endpoints still need explicit authorization checks to fully prevent misuse through direct requests.[cite:93]

### Student API routes identified so far

The student API area currently includes these sensitive routes:

- `app/api/students/route.ts` — list and create students.[cite:160]
- `app/api/students/[id]/route.ts` — update and delete students.[cite:160]
- `app/api/students/bulk-upload/route.ts` — bulk import students from CSV/tab-delimited files.[cite:160]
- `app/api/students/promote/route.ts` — promote or pass out current students in bulk.[cite:160]
- `app/api/students/[id]/enrollment/route.ts` — fetch current enrollment details for a student.[cite:160]
- `app/api/students/[id]/passed/route.ts` — update passed-student metadata.[cite:160]

These routes perform sensitive read and write operations involving student records, enrollments, bulk changes, and graduation/passed-out data.[cite:160] They should be reviewed individually for role-based access, especially because admin-only write actions should not rely only on frontend or layout protection.[cite:93]

## Why API authorization is still needed

Even when pages are protected, API routes remain callable directly through browser tools, custom requests, or scripts if the route handler itself does not check session and role.[cite:93] Self-hosting on a VPS does not remove this risk, because a server will still process incoming requests unless the application code rejects unauthorized ones.[cite:210][cite:216]

For this project, not every student API must be admin-only because lecturers legitimately need some student data for attendance workflows.[cite:160] However, admin-level actions such as create, update, delete, promote, bulk upload, and passed-student patching should have route-level authorization checks so that only users with the correct role can perform them.[cite:160][cite:196]

## Current security picture

At this stage, the system has:

- Custom JWT session authentication via cookie.[cite:63]
- Middleware that checks only whether a session cookie exists.[cite:64]
- Layout-level role protection for `/admin` and `/lecturer`.[cite:63]
- Lecturer data scoping for timetable and attendance queries.[cite:160]
- Business API routes that still need consistent route-handler authorization.[cite:160][cite:93]

## Recommended next work

The next hardening step is to add minimal role/session checks to sensitive API handlers without changing existing business logic.[cite:93] A practical order would be:

1. Protect admin-only student write routes first: `POST /api/students`, `PUT /api/students/[id]`, and `DELETE /api/students/[id]`.[cite:160]
2. Then protect `bulk-upload`, `promote`, and `passed` update routes.[cite:160]
3. Review whether `GET /api/students` and `GET /api/students/[id]/enrollment` should be admin-only or accessible to lecturers in a restricted form for attendance workflows.[cite:160]

This keeps the current app behavior working while gradually moving the project toward complete route-level authorization.[cite:93][cite:196]