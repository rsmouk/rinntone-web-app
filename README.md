# RingtonePro - Mobile Ringtones Web Application

A production-ready, ad-monetized web application for mobile ringtones built with Next.js, TypeScript, and MySQL.

## Features

### Public Features
- 📱 Mobile-first, fully responsive design
- 🔍 Global search with autocomplete and numeric ID lookup
- 🎵 Built-in audio player for instant preview
- 📁 Categories and tags for easy navigation
- 🌙 Light/Dark mode toggle
- ⏱️ Download with ad countdown timer
- 🔗 SEO-friendly URLs and metadata

### Admin Features
- 📊 Analytics dashboard with charts
- 🎵 Ringtone management (upload, edit, delete)
- 📂 Category and tag management
- 📢 Advertisement management
- 📈 Download and impression tracking

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ringtone
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example file and edit it
cp env.example.txt .env

# Edit .env with your configuration:
# DATABASE_URL="mysql://username:password@localhost:3306/ringtones_db"
# NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_SECRET="your-secret-key"
# ADMIN_EMAIL="admin@example.com"
# ADMIN_PASSWORD="your-password"
```

4. Create the database:
```sql
CREATE DATABASE ringtones_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. Run Prisma migrations:
```bash
npm run db:push
```

6. Seed the database:
```bash
npm run db:seed
```

7. Start the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000)

### Admin Access

After seeding, login at `/admin/login` with:
- Email: `admin@ringtone.com` (or your ADMIN_EMAIL)
- Password: `admin123` (or your ADMIN_PASSWORD)

## Project Structure

```
ringtone/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public pages
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   ├── search/           # Search components
│   ├── player/           # Audio player
│   ├── ads/              # Ad components
│   └── admin/            # Admin components
├── lib/                   # Utilities
├── prisma/               # Database schema
├── public/               # Static assets
├── types/                # TypeScript types
└── uploads/              # Uploaded files (created at runtime)
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed the database
npm run db:studio    # Open Prisma Studio
```

## API Routes

### Public API
- `GET /api/search` - Search ringtones
- `GET /api/search/autocomplete` - Autocomplete suggestions
- `GET /api/ringtones/[id]` - Get ringtone details
- `GET /api/ads` - Get active advertisement
- `GET /api/download/[id]` - Download ringtone file

### Admin API
- `GET/POST /api/admin/ringtones` - List/Create ringtones
- `GET/PUT/DELETE /api/admin/ringtones/[id]` - Manage ringtone
- `GET/POST /api/admin/categories` - List/Create categories
- `GET/POST /api/admin/tags` - List/Create tags
- `GET/POST /api/admin/ads` - List/Create advertisements
- `GET /api/admin/analytics` - Get analytics data

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | MySQL connection string | Yes |
| NEXTAUTH_URL | Application URL | Yes |
| NEXTAUTH_SECRET | Secret for NextAuth | Yes |
| ADMIN_EMAIL | Default admin email | No |
| ADMIN_PASSWORD | Default admin password | No |
| SITE_URL | Public site URL | No |
| DOWNLOAD_TIMER_SECONDS | Download countdown | No |

### Ad Placements

Available placement slots:
- `header` - Top of page
- `footer` - Bottom of page
- `in-content` - Between content sections
- `download-page` - Download countdown page
- `sidebar` - Sidebar area

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure all environment variables
3. Set up MySQL database
4. Run migrations: `npm run db:push`
5. Seed initial data: `npm run db:seed`

### Recommended Hosting

- **Vercel** - Optimized for Next.js
- **Railway** - Easy MySQL hosting
- **PlanetScale** - Serverless MySQL

## Security Features

- Protected admin routes with NextAuth.js
- CSRF protection
- Rate limiting on downloads
- File type validation
- SQL injection prevention (Prisma)
- XSS protection
- Hotlink protection for audio files

## License

MIT License

## Support

For issues and questions, please open a GitHub issue.
