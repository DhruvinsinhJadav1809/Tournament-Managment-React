# Tournament Management — React Frontend

A full-featured tournament management system built with React + TypeScript.
Designed for desktop use only (minimum 1024px screen width).

---

## Tech Stack

| Purpose            | Library                        |
| ------------------ | ------------------------------ |
| Build tool         | Vite + TypeScript              |
| Styling            | Tailwind CSS                   |
| UI Components      | Hand-rolled (shadcn-style)     |
| Forms & Validation | Formik + Yup                   |
| Server State       | TanStack Query v5              |
| HTTP Client        | Axios                          |
| Routing            | React Router v6                |
| Real-time          | SignalR (`@microsoft/signalr`) |
| Toasts             | react-hot-toast                |
| Icons              | Lucide React                   |
| Calendar           | react-big-calendar + date-fns  |
| Excel Export       | Blob download via Axios        |

---

## Project Structure

src/
├── api/ # All API modules (one file per domain)
│ ├── client.ts # Axios instance + interceptors (token attach, 401 redirect)
│ ├── auth.ts # Login, Register
│ ├── games.ts # Games CRUD
│ ├── tournaments.ts # Tournaments CRUD
│ ├── matches.ts # Match generation, bracket, result, schedule
│ ├── users.ts # Users list
│ ├── dashboard.ts # User dashboard APIs
│ ├── adminDashboard.ts # Admin dashboard APIs
│ ├── announcements.ts # Announcements CRUD + mark read
│ ├── notifications.ts # Notifications + unread count
│ ├── onlineUsers.ts # Online user tracker
│ ├── profile.ts # User profile + image upload
│ ├── conversation.ts # Chat get-or-create, send, messages, mark read
│ └── schedule.ts # Match schedule for calendar
│
├── components/
│ ├── common/ # Reusable UI components
│ │ ├── Input.tsx # Input with label, error, left icon, right element
│ │ ├── Button.tsx # Button (5 variants: primary/secondary/danger/ghost/outline)
│ │ ├── Select.tsx # Select dropdown
│ │ ├── Badge.tsx # Status badge (5 variants)
│ │ ├── Table.tsx # Data table with skeleton loading
│ │ ├── Modal.tsx # Modal with header/body/footer
│ │ ├── ConfirmDialog.tsx # Delete confirmation dialog
│ │ ├── Pagination.tsx # Page navigation + page size selector
│ │ ├── PageLayout.tsx # Common page wrapper (heading, subtitle, action slot)
│ │ └── MobileBlocker.tsx # Blocks screen < 1024px with logout option
│ │
│ └── layout/
│ ├── AppLayout.tsx # Shell: sidebar + topbar + main content
│ ├── Sidebar.tsx # Navigation links (role-based visibility)
│ ├── TopBar.tsx # Page title + online users + theme + bell + user menu
│ ├── ThemeToggle.tsx # Light/dark mode toggle
│ ├── NotificationPanel.tsx # Bell dropdown with notifications
│ └── OnlineUsers.tsx # Live online user count + list
│
├── hooks/
│ ├── useAuth.ts # Auth state (login, logout, user, isAdmin)
│ ├── useTheme.ts # Dark/light theme toggle + localStorage persist
│ ├── useAnnouncements.ts # SignalR: announcements hub listener
│ └── useChat.ts # SignalR: chat hub listener (ReceiveMessage)
│
├── lib/
│ └── signalr.ts # Two SignalR connections:
│ # - Announcement hub (/hubs/announcements)
│ # - Chat hub (/hubs/chat)
│ # joinConversation / leaveConversation helpers
│
├── pages/
│ ├── auth/
│ │ ├── LoginPage.tsx # Email + password, eye toggle, Formik + Yup
│ │ └── RegisterPage.tsx # Full name, email, password strength meter
│ │
│ ├── dashboard/
│ │ ├── DashboardPage.tsx # User dashboard: my tournaments, upcoming matches, available
│ │ └── AdminDashboardPage.tsx # Admin dashboard: stats, pending actions, overview, top players
│ │
│ ├── games/
│ │ └── GamesPage.tsx # Games table + Add/Edit/Delete modal + filters + pagination
│ │
│ ├── tournaments/
│ │ ├── TournamentsPage.tsx # Tournaments table + CRUD + participants modal
│ │ ├── TournamentBracketModal.tsx # Visual bracket with rounds and match cards
│ │ ├── GenerateMatchesModal.tsx # Form to generate matches (date, time, duration)
│ │ ├── MatchResultModal.tsx # Set winner + scores with validation
│ │ └── ScheduleMatchModal.tsx # Set match date + start/end time
│ │
│ ├── users/
│ │ └── UsersPage.tsx # Users table (admin view only)
│ │
│ ├── profile/
│ │ └── ProfilePage.tsx # Stats, win/loss chart, recent matches, avatar upload
│ │
│ ├── announcements/
│ │ ├── AnnouncementsPage.tsx # List with filters + mark read + stats
│ │ └── CreateAnnouncementModal.tsx # Target: AllUsers/Tournament/Match/User
│ │
│ ├── messages/
│ │ └── MessagesPage.tsx # Real-time chat (admin ↔ user, SignalR)
│ │
│ ├── schedule/
│ │ └── SchedulePage.tsx # react-big-calendar with color-coded tournaments
│ │
│ └── errors/
│ ├── ErrorBoundary.tsx # Class component catches render errors
│ └── NotFoundPage.tsx # 404 with back/home buttons
│
├── routes/
│ └── guards.tsx # PrivateRoute, AdminRoute, GuestRoute
│
├── store/
│ └── authStore.ts # localStorage read/write for auth user
│
├── types/
│ └── index.ts # All TypeScript interfaces (ApiResponse, Game, Tournament, etc.)
│
└── utils/
└── index.ts # cn(), formatDate(), getErrorMessage()

---

## Environment

Create a `.env` file from `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

The SignalR hub URLs are derived from this:

- Announcements hub: `{base without /api}/hubs/announcements`
- Chat hub: `{base without /api}/hubs/chat`

---

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

---

## Authentication

- Token stored in `localStorage` under key `auth_user`
- Axios interceptor attaches `Bearer {token}` to every request
- 401 response → clears storage → redirects to `/login`
- No refresh token — user must re-login on expiry

---

## Role-Based Access

| Role  | Pages                                                                           |
| ----- | ------------------------------------------------------------------------------- |
| Admin | Dashboard (admin), Games, Tournaments, Users, Announcements, Messages, Schedule |
| User  | Dashboard (user), Announcements, Messages, Schedule, My Profile                 |

Sidebar nav items are filtered by role. `AdminRoute` guard redirects non-admins.

---

## Real-time (SignalR)

Two separate hub connections managed in `src/lib/signalr.ts`:

### Announcement Hub (`/hubs/announcements`)

Started in `AppLayout` via `useAnnouncements` hook.
Listens for:

- `ReceiveAnnouncement` → prepends to announcements cache + toast
- `OnlineUsersUpdated` → updates online users cache

Also invokes:

- `JoinUserGroup(userId)` → joins personal group for targeted announcements

### Chat Hub (`/hubs/chat`)

Started in `AppLayout` via `useChat` hook.
Listens for:

- `ReceiveMessage` → appends to `['messages', conversationId]` cache + toast

Also invokes (from `MessagesPage`):

- `JoinConversation(conversationId)` → joins conversation group
- `LeaveConversation(conversationId)` → leaves on close/switch

---

## Key Patterns

**TanStack Query** — all server state. `useMutation` for POST/PUT/DELETE, `useQuery` for GET. After mutations, `invalidateQueries` triggers refetch of related queries.

**Formik + Yup** — all forms. `enableReinitialize: true` on edit forms. `key={item?.id}` on modals to reset form state between records.

**Dark mode** — Tailwind `darkMode: 'class'`. `useTheme` hook toggles `dark` class on `<html>` and persists to localStorage. Respects `prefers-color-scheme` on first visit.

**Common components** — `PageLayout` wraps every page with consistent heading/subtitle/action slot. `Table` handles skeleton loading, empty state, and row hover. `Modal` handles Escape key, body scroll lock, and backdrop click.

**Mobile blocker** — screens below 1024px show a full-screen overlay for authenticated users. Login/Register work on any screen size.

---

## API Conventions

All API responses follow this shape:

```ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}
```

Paginated responses:

```ts
interface PaginatedResponse<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  data: T[];
}
```

---

## Developer Notes

- Never copy API data into `useState` — use `useQuery` data directly
- `isFetching` (not just `isLoading`) for post-mutation table loaders
- `key={item?.id}` on modals prevents stale Formik state between records
- SignalR listeners use a singleton flag (`listenerRegistered`) to prevent duplicate handlers across re-renders
- Chat hub and announcement hub are completely separate connections — do not mix them
- `joinConversation` / `leaveConversation` must be called on the **chat hub**, not the announcement hub
