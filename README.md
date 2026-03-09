# WriteNest — Modern Blogging Platform

A full-featured blogging platform built with **Next.js 15**, **TypeScript**, **tRPC**, **Drizzle ORM**, and **PostgreSQL**. Create, share, and discover stories with a beautiful, responsive UI.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![tRPC](https://img.shields.io/badge/tRPC-11-2596BE)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss)

---

## Features

### Authentication

- Email/password registration and login with JWT tokens
- Google OAuth login
- Secure password hashing with bcrypt
- Protected routes and authenticated endpoints

### User Profiles

- Public profile pages accessible at `/profile/[username]`
- Auto-generated usernames on signup
- Editable bio, location, profile image, and cover image
- Public/private profile toggle
- Follower/following system with counts

### Blog Management

- Create, edit, and delete posts
- Rich markdown editor with live preview
- Auto-generated SEO-friendly slugs
- Cover images, subtitles, and excerpts
- Draft and published status system
- Like and bookmark posts

### Categories & Tags

- 100+ pre-seeded categories
- Assign multiple categories and tags to posts
- Filter and explore posts by category

### Comments

- Threaded comment system on posts

### Notifications

- In-app notification system

### UI/UX

- Responsive design (mobile, tablet, desktop)
- Dark/light theme support
- Smooth page transitions with Framer Motion
- Skeleton loading states and error boundaries
- Bento grid layout on the home page
- Trending section and explore page

---

## Tech Stack

| Layer      | Technology                                         |
| ---------- | -------------------------------------------------- |
| Framework  | Next.js 15 (App Router, Turbopack)                 |
| Language   | TypeScript                                         |
| UI         | Tailwind CSS 4, Radix UI, shadcn/ui, Framer Motion |
| API        | tRPC 11 (end-to-end type safety)                   |
| Database   | PostgreSQL with Drizzle ORM                        |
| Auth       | JWT + bcrypt, Google OAuth                         |
| State      | TanStack React Query (via tRPC)                    |
| Validation | Zod                                                |
| Markdown   | react-markdown, @uiw/react-md-editor               |
| Deployment | Vercel                                             |

---

## Project Structure

```
WriteNest/
├── public/                     # Static assets
├── scripts/
│   ├── migrate.js              # Database migration runner
│   └── seed.js                 # Database seeder
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── trpc/[trpc]/    # tRPC API handler
│   │   │   └── upload/         # File upload endpoint
│   │   ├── components/         # Shared UI components
│   │   │   ├── ui/             # shadcn/ui primitives
│   │   │   ├── blog-card.tsx
│   │   │   ├── navbar.tsx
│   │   │   ├── layout-shell.tsx
│   │   │   └── ...
│   │   ├── explore/            # Explore/discover page
│   │   ├── login/              # Login page
│   │   ├── post/[id]/          # Single post view
│   │   ├── profile/            # Own profile (auth required)
│   │   ├── profile/[username]/ # Public profile page
│   │   ├── write/              # Post editor
│   │   ├── styles/             # Global CSS & theme
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts       # Drizzle schema (all tables)
│   │   │   ├── migrations/     # SQL migrations
│   │   │   └── seed.ts         # Seed data
│   │   ├── trpc/               # tRPC client & provider
│   │   ├── utils/              # Helpers (mapPostToUI, slug)
│   │   └── validation/         # Zod schemas per domain
│   └── server/
│       └── trpc/
│           ├── router.ts       # Main app router
│           ├── trpc.ts         # tRPC init & base procedures
│           ├── context.ts      # Request context (auth, db)
│           ├── middlewares/     # Auth & validation middleware
│           └── routers/        # Domain routers
│               ├── auth.ts
│               ├── users.ts
│               ├── posts.ts
│               ├── categories.ts
│               ├── comments.ts
│               ├── likes.ts
│               ├── bookmarks.ts
│               ├── followers.ts
│               ├── tags.ts
│               └── notifications.ts
├── drizzle.config.ts
├── package.json
├── tsconfig.json
└── vercel.json
```

---

## Database Schema

| Table             | Description                      |
| ----------------- | -------------------------------- |
| `users`           | User accounts and profiles       |
| `posts`           | Blog posts with author reference |
| `categories`      | Post categories                  |
| `post_categories` | Many-to-many posts ↔ categories  |
| `tags`            | Post tags                        |
| `post_tags`       | Many-to-many posts ↔ tags        |
| `comments`        | Post comments                    |
| `likes`           | Post likes                       |
| `bookmarks`       | Saved/bookmarked posts           |
| `followers`       | User follow relationships        |
| `notifications`   | In-app notifications             |

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 12+
- **npm**

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd WriteNest
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=blog_platform
DB_SSL=false

# Auth
JWT_SECRET=your_secret_key_min_32_characters

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Set up the database

```bash
# Run migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command               | Description                      |
| --------------------- | -------------------------------- |
| `npm run dev`         | Start dev server with Turbopack  |
| `npm run build`       | Production build                 |
| `npm run start`       | Start production server          |
| `npm run lint`        | Run ESLint                       |
| `npm run db:generate` | Generate Drizzle migrations      |
| `npm run db:push`     | Push schema directly to database |
| `npm run db:migrate`  | Run pending migrations           |
| `npm run db:seed`     | Seed database with sample data   |
| `npm run db:studio`   | Open Drizzle Studio (DB browser) |

---

## API Routes (tRPC)

All API calls are fully type-safe via tRPC. Key routers:

- **auth** — signup, login, Google login, me
- **users** — list, getById, update, getProfile, getPublicProfile
- **posts** — create, update, delete, list, getBySlug, listByAuthor, listPublishedByAuthor
- **categories** — list, create
- **tags** — list, create
- **comments** — create, list by post
- **likes** — toggle, status
- **bookmarks** — toggle, list
- **followers** — toggle, status, counts, listFollowers, listFollowing
- **notifications** — list, markRead

---

## Deployment

The project includes a `vercel.json` for Vercel deployment. Set the environment variables in your Vercel project settings and deploy.

---

## License

MIT
