# SwipeHire - Skills-First Job Matching Platform

> A skills-first, swipe-to-match hiring app that connects talent with opportunities through intelligent matching. Think "Tinder for jobs" but bias-lite, mutual-intent, and with instant scheduling.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-black.svg)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-white.svg)](https://socket.io/)

## 🎯 Features

### Core Functionality
- **Skills-First Matching**: Match based on actual skills and experience, not just keywords
- **Mutual Swipe System**: Both candidates and recruiters swipe to create matches
- **Real-time Chat**: Instant messaging with Socket.IO for matched pairs
- **Bias-Free Profiles**: Focus on skills and qualifications over demographics
- **Instant Scheduling**: Book interviews directly through integrated scheduling

### User Roles
- **Candidates**: Browse jobs, showcase skills, swipe on opportunities
- **Recruiters**: Post jobs, discover talent, swipe on candidates

### Technical Features
- **Real-time Communication**: Socket.IO powered chat and notifications
- **Rate Limiting**: Daily swipe caps and message limits
- **Analytics**: PostHog integration for user behavior tracking
- **File Uploads**: Cloudinary integration for avatars and resumes
- **Authentication**: Clerk-powered auth with Google/LinkedIn/email OTP

## 🏗️ Architecture

```
SwipeHire/
├── frontend/          # Next.js 14 app with Tailwind CSS
├── backend/           # Express + Socket.IO + MongoDB
├── package.json       # Monorepo scripts
├── pnpm-workspace.yaml
└── README.md
```

### Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 14 + React + TypeScript | Modern web application |
| **UI Framework** | Tailwind CSS + Headless UI | Responsive design system |
| **Authentication** | Clerk | User management & auth |
| **Backend API** | Express.js + TypeScript | REST API and business logic |
| **Database** | MongoDB Atlas + Mongoose | Data persistence |
| **Real-time** | Socket.IO | Chat and notifications |
| **File Storage** | Cloudinary | Avatar and resume uploads |
| **Analytics** | PostHog | User behavior tracking |
| **Deployment** | Railway/Render/Fly.io | Production hosting |

## 🚀 Quick Start (Windows PowerShell)

### Prerequisites

```powershell
# Install Node.js 20+ from https://nodejs.org
node --version  # Should be 20.x or higher

# Install pnpm globally
npm install -g pnpm
pnpm --version
```

### 1. Clone and Setup

```powershell
# Clone the repository
git clone https://github.com/your-org/swipehire.git
cd swipehire

# Install dependencies
pnpm install

# Copy environment files
Copy-Item env.frontend.example -Destination frontend/.env.local
Copy-Item env.backend.example -Destination backend/.env
```

### 2. Configure Environment Variables

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
```

**Backend (`backend/.env`):**
```env
# Clerk
CLERK_SECRET_KEY=sk_test_your_secret_key
WEBHOOK_SECRET_CLERK=whsec_your_webhook_secret

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/swipehire

# Cloudinary
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name

# Server
PORT=4000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development

# Analytics (optional)
POSTHOG_KEY=your_posthog_key
```

### 3. Setup External Services

#### MongoDB Atlas
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster
3. Create database user and get connection string
4. Add your IP to allowlist

#### Clerk Authentication
1. Create account at [Clerk](https://clerk.com/)
2. Create new application
3. Configure sign-in methods (Google, LinkedIn, Email OTP)
4. Set allowed origins: `http://localhost:3000`
5. Create webhook endpoint: `http://localhost:4000/api/v1/auth/webhook`
6. Copy keys to environment files

#### Cloudinary (Optional)
1. Create account at [Cloudinary](https://cloudinary.com/)
2. Create upload preset named `swipehire_uploads`
3. Copy API credentials to environment files

#### PostHog Analytics (Optional)
1. Create account at [PostHog](https://posthog.com/)
2. Copy project API key to environment files

### 4. Run the Application

```powershell
# Start both frontend and backend
pnpm run dev

# Or run individually
pnpm run dev:backend   # Backend on http://localhost:4000
pnpm run dev:frontend  # Frontend on http://localhost:3000
```

### 5. Seed Sample Data

```powershell
# Create sample users, jobs, and matches
pnpm run seed
```

## 📱 Application Flow

### User Journey

```mermaid
graph TD
    A[Landing Page] --> B{Sign Up/In}
    B --> C[Role Selection]
    C --> D[Profile Creation]
    D --> E[Dashboard]
    E --> F[Swipe Interface]
    F --> G{Match?}
    G -->|Yes| H[Chat Opens]
    G -->|No| F
    H --> I[Schedule Interview]
```

### API Architecture

```mermaid
graph TB
    A[Next.js Frontend] --> B[Express Backend]
    B --> C[MongoDB Atlas]
    B --> D[Socket.IO Server]
    B --> E[Clerk Auth]
    B --> F[Cloudinary]
    A --> G[PostHog Analytics]
    D --> H[Real-time Chat]
```

## 🔧 Development

### Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Landing page
│   ├── components/          # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── cards/           # Job/Candidate cards
│   │   ├── chat/            # Chat components
│   │   └── forms/           # Form components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and config
│   ├── providers/           # Context providers
│   └── middleware.ts        # Clerk middleware
├── styles/globals.css       # Global styles
└── tailwind.config.ts       # Tailwind configuration

backend/
├── src/
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Express middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── sockets/             # Socket.IO handlers
│   ├── utils/               # Utilities
│   ├── lib/                 # External service configs
│   └── server.ts            # Main server file
└── tests/                   # Test files
```

### Available Scripts

```powershell
# Development
pnpm run dev              # Start both frontend and backend
pnpm run dev:frontend     # Start Next.js dev server
pnpm run dev:backend      # Start Express dev server

# Building
pnpm run build            # Build both applications
pnpm run build:frontend   # Build Next.js app
pnpm run build:backend    # Build Express app

# Production
pnpm run start            # Start both in production
pnpm run start:frontend   # Start Next.js production server
pnpm run start:backend    # Start Express production server

# Database
pnpm run seed             # Seed database with sample data

# Testing
pnpm run test             # Run all tests
pnpm run test:frontend    # Run frontend tests
pnpm run test:backend     # Run backend tests

# Code Quality
pnpm run lint             # Lint all code
pnpm run type-check       # TypeScript type checking
```

### Database Models

```typescript
// Core entities with required indexes
User { authUserId, role, email }
CandidateProfile { userId, title, skills[], yoe, location, expectedCTC }
RecruiterProfile { userId, company{name, domain}, seatCount }
Job { recruiterId, title, stack[], minYoe, location, salaryBand }
Swipe { fromUserId, targetType, targetId, dir } // Unique index
Match { candidateUserId, jobId, recruiterUserId } // Unique index
Message { matchId, senderId, body, ts }
Report { reportedId, reporterId, reason, status }
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/me` | Get current user profile |
| `PUT` | `/api/v1/me` | Update user profile |
| `GET` | `/api/v1/jobs` | List jobs with filters |
| `POST` | `/api/v1/jobs` | Create job (recruiter only) |
| `POST` | `/api/v1/swipes` | Record swipe decision |
| `GET` | `/api/v1/matches` | Get user's matches |
| `GET` | `/api/v1/messages` | Get chat messages |
| `POST` | `/api/v1/messages` | Send message |
| `POST` | `/api/v1/reports` | Report user/content |

### Socket.IO Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `join:match` | Client → Server | `{matchId}` | Join chat room |
| `message:send` | Client → Server | `{matchId, body}` | Send message |
| `message:new` | Server → Client | `{message}` | New message received |
| `typing:start` | Client → Server | `{matchId}` | Start typing indicator |
| `typing:stop` | Client → Server | `{matchId}` | Stop typing indicator |
| `match:new` | Server → Client | `{matchId}` | New match notification |

## 🚀 Deployment

### Railway Deployment

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Environment Variables for Production

Update your production environment with:

```env
# Frontend
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
NEXT_PUBLIC_APP_URL=https://your-frontend.railway.app

# Backend
CORS_ORIGIN=https://your-frontend.railway.app
NODE_ENV=production
```

### Custom Server for Socket.IO

The backend runs a custom server that combines Next.js with Socket.IO:

```javascript
// Deployment starts with: node dist/server.js
const app = express();
const httpServer = createServer(app);
const io = initializeSocketIO(httpServer);
```

## 🧪 Testing

### Running Tests

```powershell
# Run all tests
pnpm test

# Run with coverage
pnpm test -- --coverage

# Run in watch mode
pnpm test:watch
```

### Test Structure

- **Unit Tests**: Model validation, utility functions
- **Integration Tests**: API endpoints with mock database
- **E2E Tests**: Full user flows (planned)

## 📊 Analytics Events

SwipeHire tracks these key events:

- `user_signed_up` - New user registration
- `profile_completed` - Profile setup finished
- `job_posted` - New job created
- `swipe_made` - Swipe action taken
- `match_created` - Mutual match occurred
- `message_sent` - Chat message sent
- `daily_active` - Daily active user

## 🛡️ Security Features

- **Authentication**: Clerk-managed JWT tokens
- **Rate Limiting**: Daily swipe caps, message limits
- **Input Validation**: Zod schema validation
- **CORS Protection**: Configured for specific origins
- **SQL Injection**: MongoDB with Mongoose ODM
- **Report System**: User reporting and moderation

## 🔄 Data Flow

### Matching Algorithm

1. **Candidate swipes right on Job**
2. **System checks if Recruiter already swiped right on Candidate**
3. **If yes → Create Match + Send notifications**
4. **If no → Wait for Recruiter's swipe**

### Real-time Features

- **Chat Messages**: Instant delivery via Socket.IO
- **Match Notifications**: Real-time alerts
- **Typing Indicators**: Live typing status
- **Connection Status**: Online/offline indicators

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```powershell
# Kill process on port 3000/4000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**MongoDB connection failed:**
- Check connection string format
- Verify IP allowlist in Atlas
- Ensure database user exists

**Clerk authentication issues:**
- Verify publishable/secret keys
- Check webhook URL configuration
- Ensure CORS origins are set

**Socket.IO connection failed:**
- Check WebSocket URL format
- Verify CORS configuration
- Ensure auth token is valid

### Debug Mode

```powershell
# Enable debug logging
$env:DEBUG = "socket.io*,mongoose:*"
pnpm run dev:backend
```

## 📈 Performance Optimizations

- **Database Indexes**: Optimized for matching queries
- **Connection Pooling**: MongoDB connection management
- **Rate Limiting**: Prevents API abuse
- **Lazy Loading**: Code splitting with Next.js
- **Image Optimization**: Cloudinary transformations
- **Caching**: API response caching (planned)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Clerk** for authentication infrastructure
- **MongoDB Atlas** for database hosting
- **Socket.IO** for real-time communication
- **Tailwind CSS** for UI framework
- **PostHog** for analytics platform

---

## 🆘 Support

For support and questions:

- 📧 Email: support@swipehire.com
- 💬 Discord: [SwipeHire Community](https://discord.gg/swipehire)
- 📖 Docs: [docs.swipehire.com](https://docs.swipehire.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/swipehire/issues)

---

**Made with ❤️ by the SwipeHire team**
