# Tournament Management

A React + TypeScript frontend for the Tournament Management system.

## Stack

| Purpose | Library |
|---|---|
| Build tool | Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | Hand-rolled (shadcn-style) |
| Forms | Formik + Yup |
| API calls | TanStack Query + Axios |
| Routing | React Router v6 |
| Toasts | react-hot-toast |
| Icons | Lucide React |

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and set API URL
cp .env.example .env

# 3. Start dev server
npm run dev
```

## Project structure

```
src/
├── api/           # Axios API modules (auth, games, tournaments, users)
├── components/
│   ├── common/    # Input, Button, Select, Table, Modal, Badge, Pagination…
│   └── layout/    # Sidebar, AppLayout
├── hooks/         # useAuth
├── pages/
│   ├── auth/      # LoginPage
│   ├── games/     # GamesPage (CRUD)
│   ├── tournaments/ # TournamentsPage (CRUD)
│   ├── users/     # UsersPage (view)
│   └── errors/    # ErrorBoundary, NotFoundPage
├── routes/        # PrivateRoute, AdminRoute, GuestRoute
├── store/         # authStore (localStorage)
├── types/         # All TypeScript types
└── utils/         # cn(), formatDate(), getErrorMessage()
```

## Auth

- Token stored in `localStorage` under key `auth_user`
- Attached automatically to every request via Axios interceptor
- 401 responses clear storage and redirect to `/login`
- Role-based routing: Admin sees Users page, plain User does not

## Environment

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Your .NET API base URL (default: `http://localhost:5000/api`) |
