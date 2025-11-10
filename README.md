# Shader House

**Where indie games shine** ✨

An immersive indie game marketplace with custom authentication, magical UI, and a forest-inspired aesthetic.

## 🚀 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Custom JWT-based authentication (HttpOnly cookies)
- **UI Components**: Radix UI, Custom game-themed components
- **Dev Tools**: ESLint, PostCSS, Autoprefixer

## 📦 Getting Started

### Prerequisites

- Node.js 18+ 
- Docker (for PostgreSQL)
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd shader-house
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Start PostgreSQL with Docker
   docker-compose up -d
   
   # Run migrations
   npm run db:migrate
   ```
   
   📘 **See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed database instructions**

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Visit [http://localhost:3000](http://localhost:3000) 🎮

## 🗄️ Database

Shader House uses PostgreSQL with Prisma ORM. See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for:
- Quick start with Docker
- Schema overview
- Troubleshooting
- Production deployment

## 🎨 Features

- ✅ **Custom Authentication** - JWT-based with HttpOnly cookies
- ✅ **Magical Forest Theme** - Immersive background with particles and glow effects  
- ✅ **Game Icons** - Professional outline-style icon set
- ✅ **Smooth Animations** - Framer Motion powered transitions
- ✅ **Responsive Design** - Mobile-first, accessible UI
- ✅ **Form Validation** - Organic, user-friendly error messages
- ✅ **Database Integration** - PostgreSQL with Prisma ORM
- 🔜 **Game Uploads** - For developers
- 🔜 **Game Library** - For gamers
- 🔜 **Search & Filters** - Discover games

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database commands
npm run db:generate  # Generate Prisma Client
npm run db:migrate   # Create and apply migrations
npm run db:push      # Push schema without migration
npm run db:studio    # Open Prisma Studio (visual DB editor)
```

## 📁 Project Structure

```
shader-house/
├── app/                    # Next.js App Router
│   ├── api/auth/          # Authentication API routes
│   ├── (auth)/            # Auth pages (login, register, reset)
│   ├── page.tsx           # Home page
│   └── layout.tsx         # Root layout
├── components/            
│   ├── audio/             # Audio provider & controls
│   ├── auth/              # Auth-specific components
│   ├── fx/                # Visual effects (particles, backgrounds)
│   ├── game/              # Game-themed UI components
│   ├── icons/             # Custom SVG icon set
│   └── layout/            # Layout components
├── lib/
│   ├── auth/              # Authentication logic
│   └── db/                # Prisma client singleton
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── public/                # Static assets
└── styles/                # Global styles
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
