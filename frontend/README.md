# Travista Frontend

Frontend application for Travista - an AI-powered travel itinerary planning platform for South Korea. Built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

## 🛠 Tech Stack

- **Framework:** Next.js 15.5 (App Router)
- **React:** React 19.1
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4.1
- **UI Components:** 
  - Radix UI (Dialog, Dropdown, Popover, etc.)
  - Material-UI Icons
  - Headless UI (Transitions)
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios
- **Maps:** Naver Maps API
- **Date Picker:** React DatePicker
- **Animations:** Framer Motion
- **Code Quality:** ESLint, Prettier

## ✨ Features

### Core Functionality

- **🏠 Landing Page** - Hero section with feature highlights and how-it-works guide
- **🔐 Authentication** - Email/password and Google OAuth login/signup
- **🗺️ Interactive Map** - Naver Maps integration with 3D aerial view
- **🔍 Location Search** - Real-time search with debouncing, supports Korean and English
- **📅 Itinerary Planning** - Multi-step form to collect user preferences
- **🤖 AI-Powered Itinerary** - AI-generated travel plans with optimized routes
- **📍 Route Visualization** - Interactive map showing itinerary with markers and paths
- **📝 Plan Management** - View, edit, and customize generated itineraries
- **🖼️ Image Upload** - Upload location images for AI analysis
- **📱 Responsive Design** - Mobile-first, fully responsive across all devices

### User Experience

- **Smooth Animations** - Framer Motion for page transitions
- **Loading States** - Skeleton loaders and loading indicators
- **Error Handling** - User-friendly error messages
- **Form Validation** - Real-time validation with helpful error messages
- **Accessibility** - ARIA labels and keyboard navigation support

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   │   ├── login/        # Login page
│   │   │   └── signup/       # Signup page
│   │   ├── plan/              # Itinerary planning pages
│   │   │   ├── ai-generated/ # AI-generated plan view
│   │   │   ├── InitPlan.tsx  # Initial plan form
│   │   │   └── page.tsx      # Plan page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── error.tsx          # Error boundary
│   ├── components/            # React components
│   │   ├── layout/           # Layout components
│   │   │   ├── header.tsx    # Navigation header
│   │   │   └── footer.tsx    # Footer
│   │   ├── map/              # Map components
│   │   │   └── NaverMap.tsx # Naver Maps integration
│   │   ├── planner/          # Planner components
│   │   │   ├── PlannerForm.tsx
│   │   │   ├── PlannerMap.tsx
│   │   │   └── PlannerResult.tsx
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown.tsx
│   │   │   ├── input.tsx
│   │   │   ├── searchLocationInput.tsx
│   │   │   ├── imageDropzone.tsx
│   │   │   └── ...
│   │   └── shared/           # Shared components
│   ├── config/               # Configuration files
│   │   ├── api.ts            # API endpoint constants
│   │   ├── axiosClient.ts    # Axios instance with interceptors
│   │   └── env.ts            # Environment variables
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── hooks/                # Custom React hooks
│   │   ├── usePlanner.ts    # Planner hook
│   │   └── useModal.ts      # Modal management hook
│   ├── services/             # API service layer
│   │   ├── planner.service.ts
│   │   └── mapper.service.ts
│   ├── store/                # Zustand stores
│   │   └── index.ts
│   ├── types/                # TypeScript type definitions
│   │   ├── planner.ts
│   │   ├── location.ts
│   │   ├── map.ts
│   │   └── review.ts
│   ├── lib/                  # Utility functions
│   │   └── utils.ts
│   ├── assets/               # Static assets
│   │   ├── images/          # Image files
│   │   ├── icons/           # Icon files
│   │   └── logo.svg
│   └── styles/              # Global styles
│       └── globals.css      # Tailwind CSS and custom styles
├── public/                   # Public static files
├── next.config.ts           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20 or higher
- **npm** or **yarn** or **pnpm**
- Backend API running (see [Backend README](../backend/README.md))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd travista/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables** (see [Environment Variables](#-environment-variables))

5. **Start development server**
   ```bash
   npm run dev
   ```

The application will start on `http://localhost:3000`.

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```env
# Backend API URL
NEXT_PUBLIC_NODE_API_URL=http://localhost:5000

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Naver Maps Client ID (for map integration)
NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID=your-naver-maps-client-id
```

### Environment Variable Descriptions

- **NEXT_PUBLIC_NODE_API_URL** - Backend API base URL (required)
- **NEXT_PUBLIC_APP_URL** - Frontend application URL (required)
- **NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID** - Naver Maps API client ID for map integration (required)

> **Note:** All environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Do not include sensitive information.

## 📡 API Integration

The frontend communicates with the backend API through:

- **Axios Client** (`src/config/axiosClient.ts`) - Configured with:
  - Base URL from environment variables
  - Request interceptors for JWT token injection
  - Response interceptors for error handling
  - 15-second default timeout (3 minutes for planner API)

- **Service Layer** (`src/services/`) - Organized API calls:
  - `planner.service.ts` - Itinerary planning endpoints
  - `mapper.service.ts` - Route mapping endpoints

## 🎨 Styling

### Tailwind CSS

The project uses Tailwind CSS 4.1 with custom configuration:

- **Custom Colors** - Defined in `globals.css`:
  - Primary: Blue (`rgb(45,111,247)`)
  - Secondary: Teal (`rgb(0,196,154)`)
  - Dark Text: Dark blue-gray
  - Sub Text: Medium gray

- **Custom Breakpoints:**
  - `xs`: 320px
  - `md`: 768px
  - `lg`: 1152px
  - `xl`: 1440px
  - `2xl`: 1920px

- **Typography** - Custom font classes:
  - `header-h1`, `header-h2`, `header-h3`, `header-h4`, `header-h5`
  - `paragraph-p1-semibold`, `paragraph-p2-medium`, etc.

### Component Styling

- **Radix UI** - Accessible, unstyled components
- **Custom Components** - Styled with Tailwind utility classes
- **Responsive Design** - Mobile-first approach with breakpoint utilities

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack

# Build
npm run build        # Build production bundle with Turbopack

# Production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

### Development Workflow

1. **Start the backend API** (see [Backend README](../backend/README.md))

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   ```
   http://localhost:3000
   ```

4. **The development server will:**
   - Hot reload on file changes (Turbopack)
   - Show compilation errors in the browser
   - Provide fast refresh for React components

### Code Structure Guidelines

- **Pages** - Use Next.js App Router conventions
- **Components** - Organize by feature/domain
- **Hooks** - Custom hooks for reusable logic
- **Services** - API communication layer
- **Types** - TypeScript interfaces and types
- **Utils** - Pure utility functions

## 🗺️ Naver Maps Integration

The application uses Naver Maps API for map visualization:

1. **Setup:**
   - Get Naver Maps Client ID from [Naver Cloud Platform](https://www.ncloud.com)
   - Add to `NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID` in `.env.local`

2. **Usage:**
   - Map component: `src/components/map/NaverMap.tsx`
   - Type definitions: `src/types/naver.d.ts`

3. **Features:**
   - Interactive map with markers
   - Route visualization
   - 3D aerial view
   - Location search integration

## 🔐 Authentication

Authentication is handled through:

- **Auth Context** (`src/contexts/AuthContext.tsx`) - Global auth state
- **Protected Routes** - Redirects to login if not authenticated
- **JWT Tokens** - Stored in localStorage
- **Google OAuth** - OAuth flow integration

## 📱 Responsive Design

The application is fully responsive:

- **Mobile** (< 768px) - Single column, stacked layouts
- **Tablet** (768px - 1152px) - Two-column layouts where appropriate
- **Desktop** (> 1152px) - Full multi-column layouts

### Mobile Features

- Hamburger menu for navigation
- Touch-friendly form inputs
- Optimized map viewport
- Collapsible sections

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables** in Vercel dashboard:
   - `NEXT_PUBLIC_NODE_API_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID`

### Deploy to Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify** - Connect GitHub repo, set build command: `npm run build`
- **AWS Amplify** - Connect repository, auto-detect Next.js
- **Docker** - Create Dockerfile (see example below)

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

## ⚠️ Important Notes

### API Timeouts

- **Default timeout:** 15 seconds
- **Planner API timeout:** 3 minutes (180 seconds) - Extended for AI generation

### Browser Compatibility

- **Modern browsers** - Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile browsers** - iOS Safari, Chrome Mobile
- **No IE11 support**

### Performance

- **Code Splitting** - Automatic with Next.js App Router
- **Image Optimization** - Next.js Image component
- **Lazy Loading** - Components loaded on demand
- **Caching** - API responses cached where appropriate

## 🐛 Troubleshooting

### Build Errors

- **Clear `.next` folder:** `rm -rf .next`
- **Reinstall dependencies:** `rm -rf node_modules && npm install`
- **Check Node.js version:** Ensure v20 or higher

### API Connection Issues

- Verify `NEXT_PUBLIC_NODE_API_URL` is correct
- Ensure backend API is running
- Check CORS configuration on backend
- Verify network connectivity

### Map Not Loading

- Verify `NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID` is set
- Check browser console for API errors
- Ensure Naver Maps API is enabled in Naver Cloud Platform
- Verify domain is whitelisted in Naver Maps console

### Authentication Issues

- Clear localStorage: `localStorage.clear()`
- Check backend session configuration
- Verify OAuth redirect URIs match
- Check browser console for errors

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Test your changes
5. Submit a pull request

## 📝 License

MIT
