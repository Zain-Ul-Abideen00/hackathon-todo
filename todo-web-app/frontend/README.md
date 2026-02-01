# Todo Web App - Frontend

A modern, full-stack task management application built with **Next.js 16**, **React 19**, and **Better Auth**. Features a beautiful, responsive UI powered by **Lightswind** components and **Tailwind CSS v4**.

---

## 🚀 Tech Stack

### Core Framework
- **[Next.js 16.1.1](https://nextjs.org/)** - React framework with App Router
- **[React 19.2.3](https://react.dev/)** - UI library with React Compiler support
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe development

### Styling & UI
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lightswind 3.1.20](https://lightswind.com/)** - Premium UI component library
- **[Framer Motion 12](https://www.framer.com/motion/)** - Animation library
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Dark/Light mode theming

### Authentication & Data
- **[Better Auth 1.4.10](https://www.better-auth.com/)** - Modern authentication with PostgreSQL
- **[React Query (TanStack Query)](https://tanstack.com/query)** - Server state management
- **[Zustand 5](https://github.com/pmndrs/zustand)** - Client state management
- **[Zod 4](https://zod.dev/)** - Schema validation
- **[React Hook Form 7](https://react-hook-form.com/)** - Form handling

### AI Chat
- **[@openai/chatkit-react](https://github.com/openai/chatkit)** - AI chat widget integration
- **LiteLLM Backend** - Gemini/Groq model support via backend API

### Development Tools
- **[Biome 2.3](https://biomejs.dev/)** - Linting and formatting
- **[next-devtools-mcp](https://github.com/modelcontextprotocol/servers/tree/main/src/next-devtools)** - Next.js MCP integration for AI agents

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (dashboard)/          # Protected dashboard routes
│   │   │   ├── dashboard/        # Main dashboard
│   │   │   ├── tasks/            # Task management
│   │   │   ├── calendar/         # Calendar view
│   │   │   ├── settings/         # User settings
│   │   │   └── layout.tsx        # Dashboard layout with sidebar
│   │   ├── auth/                 # Authentication pages
│   │   │   ├── login/            # Login page
│   │   │   └── signup/           # Signup page
│   │   ├── api/                  # API route handlers
│   │   │   └── auth/[...all]/    # Better Auth API routes
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Landing page
│   │   └── globals.css           # Global styles
│   │
│   ├── components/
│   │   ├── auth/                 # Auth components (LoginForm, SignupForm)
│   │   ├── chat/                 # AI chat components
│   │   │   ├── ChatBot.tsx       # Main ChatKit component
│   │   │   ├── ChatWidgetFacade.tsx  # Floating widget wrapper
│   │   │   └── config.ts         # ChatKit configuration
│   │   ├── landing/              # Landing page sections (Hero, Features, CTA)
│   │   ├── layout/               # Layout components
│   │   │   ├── DashboardHeader.tsx      # Header with breadcrumb, search, user menu
│   │   │   ├── DashboardSidebar.tsx     # Desktop sidebar navigation
│   │   │   └── MobileBottomNav.tsx      # Mobile bottom navigation dock
│   │   ├── tasks/                # Task management components
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskList.tsx
│   │   │   └── AddTaskForm.tsx
│   │   ├── lightswind/           # Lightswind UI components (31 components)
│   │   └── providers/            # Context providers (QueryProvider, ThemeProvider)
│   │
│   ├── lib/
│   │   ├── auth.ts               # Better Auth server config
│   │   ├── auth-client.ts        # Better Auth client hooks
│   │   ├── api.ts                # API client utilities
│   │   ├── api/tasks.ts          # Task API methods
│   │   ├── schemas/              # Zod validation schemas
│   │   └── utils.ts              # Utility functions (cn, etc.)
│   │
│   ├── stores/
│   │   └── taskStore.ts          # Zustand store for task state
│   │
│   ├── types/
│   │   ├── task.ts               # Task types
│   │   └── api.ts                # API response types
│   │
│   └── hooks/                    # Custom React hooks
│
├── public/                       # Static assets
├── docs/                         # Documentation
│   └── authentication-flow.md    # Auth implementation guide
├── .env.example                  # Environment variables template
├── package.json
├── tsconfig.json
├── biome.json                    # Biome configuration
└── next.config.ts
```

---

## ✨ Features

### 🤖 AI Chatbot
- **Natural Language Tasks**: Create, update, and manage tasks through conversation
- **Floating Chat Widget**: Beautiful ChatBot component with backdrop blur
- **Thread Management**: Persistent conversation history
- **Tool Execution Feedback**: Real-time status updates for task operations
- **Responsive Design**: Works seamlessly on desktop and mobile

### 🔐 Authentication
- **Email/Password Authentication** via Better Auth
- **Session Management** with PostgreSQL storage
- **Auto Sign-in** after registration
- **Protected Routes** with middleware
- **Auth State Caching** for performance

### 📋 Task Management
- **CRUD Operations**: Create, Read, Update, Delete tasks
- **Task Filtering**: All, Active, Completed
- **Real-time Updates**: Optimistic UI updates with React Query
- **User Isolation**: Tasks scoped to authenticated user

### 🎨 UI/UX
- **Responsive Design**: Desktop (sidebar) + Mobile (bottom nav)
- **Dark/Light Mode**: Theme switcher with system preference detection
- **Animations**: Smooth transitions with Framer Motion
- **Premium Components**: Lightswind component library
- **Mobile Sidebar**: Hamburger menu with Sheet drawer
- **Search & Filters**: Task search and status filtering

### 🚀 Performance
- **React 19 Compiler**: Automatic component memoization
- **Incremental Static Regeneration**: Fast page loads
- **Optimistic Updates**: Instant UI feedback
- **Code Splitting**: Automatic route-based splitting

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js 20+**
- **pnpm** (recommended) or npm/yarn
- **PostgreSQL Database** (Neon recommended)

### Environment Setup

1. **Clone the repository**
   ```bash
   cd todo-web-app/frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your values:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL="http://localhost:8000"

   # Database (Neon PostgreSQL)
   DATABASE_URL="postgresql://user:password@your-neon-host/neondb?sslmode=require"

   # Better Auth
   BETTER_AUTH_SECRET="your-secret-min-32-chars"  # Generate with: openssl rand -base64 32
   NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
   ```

4. **Run database migrations**
   ```bash
   pnpm exec better-auth migrate
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

---

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server (port 3000) |
| `pnpm build` | Build production bundle |
| `pnpm start` | Start production server |
| `pnpm lint` | Run Biome linter |
| `pnpm lint:fix` | Auto-fix linting issues |
| `pnpm format` | Format code with Biome |

---

## 🏗️ Architecture

### App Router Structure
- **Route Groups**: `(dashboard)` for protected routes
- **Layouts**: Shared layouts for auth and dashboard
- **Loading States**: Suspense boundaries with loading.tsx
- **Error Handling**: Error boundaries with error.tsx

### State Management
- **Server State**: React Query for API data fetching/caching
- **Client State**: Zustand for UI state (search, filters)
- **Form State**: React Hook Form with Zod validation

### Authentication Flow
1. User submits credentials via `LoginForm`/`SignupForm`
2. Better Auth validates and creates session in PostgreSQL
3. Session cookie stored (HttpOnly, Secure)
4. Protected routes check session via middleware
5. Client hooks (`useSession`) provide auth state

### API Integration
- **Base URL**: Configured via `NEXT_PUBLIC_API_URL`
- **Auth**: Session token from Better Auth
- **Methods**: Tasks API (`GET`, `POST`, `PUT`, `DELETE`)
- **Error Handling**: Centralized error handling with toast notifications

---

## 🎨 Component Library

### Lightswind Components (31 total)
- **Forms**: Input, Button, Checkbox, Select, Textarea
- **Layout**: Sidebar, Sheet, Dialog, Dropdown Menu
- **Feedback**: Toast, Alert, Badge, Skeleton
- **Data Display**: Card, Table, Avatar, Tabs
- **Animation**: 3D effects, Scroll triggers, Morphing animations

### Custom Components
- **DashboardSidebar**: Collapsible navigation with active state
- **DashboardHeader**: Breadcrumb, search, theme toggle, user menu
- **MobileBottomNav**: Dock-style navigation with magnification
- **TaskCard**: Interactive task item with hover effects
- **AddTaskForm**: Modal form with validation

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import your Git repository to Vercel
   - Framework preset: Next.js

2. **Configure Environment Variables**
   - Add all variables from `.env.example`
   - Set `DATABASE_URL` to production Neon URL
   - Generate new `BETTER_AUTH_SECRET`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker

Build and run with Docker:
```bash
docker build -t todo-frontend .
docker run -p 3000:3000 --env-file .env todo-frontend
```

---

## 🔧 Configuration

### Biome (Linting & Formatting)
Configuration in `biome.json`:
- **Linter**: ESLint-compatible rules
- **Formatter**: Prettier-compatible with 2-space tabs
- **Import Sorting**: Automatic import organization

### TypeScript
- **Strict Mode**: Enabled
- **Path Aliases**: `@/*` maps to `src/*`
- **React Compiler**: babel-plugin-react-compiler enabled

### Tailwind CSS
- **Version**: v4 (PostCSS)
- **Custom Theme**: Extended colors, animations, utilities
- **JIT Mode**: Just-in-Time compilation

---

## 📚 Documentation

- [Authentication Flow](./docs/authentication-flow.md) - Better Auth setup guide
- [Next.js Docs](https://nextjs.org/docs) - Official Next.js documentation
- [Better Auth Docs](https://www.better-auth.com/docs) - Auth configuration
- [Lightswind Docs](https://lightswind.com/docs) - Component library reference

---

## 🤝 Development Workflow

### Adding a New Feature
1. **Create Feature Branch**: `git checkout -b feature/your-feature`
2. **Add Types**: Define types in `src/types/`
3. **Create Components**: Build in `src/components/`
4. **Add API Methods**: Implement in `src/lib/api/`
5. **Update Routes**: Add pages in `src/app/`
6. **Test**: Manual testing + verify with Biome
7. **Submit PR**: Push and create pull request

### Code Quality
- **Linting**: Automatic via Biome on save
- **Type Safety**: TypeScript strict mode
- **Formatting**: Consistent 2-space indentation
- **Validation**: Zod schemas for runtime checks

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify `DATABASE_URL` is correct
- Ensure Neon database is running
- Check SSL mode: `?sslmode=require`

**Auth Session Not Persisting**
- Clear browser cookies
- Verify `BETTER_AUTH_SECRET` matches backend
- Check session expiry settings

**Build Errors**
- Clear `.next` folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Check TypeScript errors: `pnpm lint`

---

## 📄 License

This project is part of the GIAIC Q4 Hackathon.

---

## 🙏 Acknowledgments

- **Next.js Team** - Framework
- **Better Auth** - Authentication library
- **Lightswind** - UI component library
- **Vercel** - Deployment platform

---

## 👨‍💻 Author

**Zain UL Abideen** ([@Zain-Ul-Abideen00](https://github.com/Zain-Ul-Abideen00))
