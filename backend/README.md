# Travista Backend API

Backend service for Travista - an AI-powered travel itinerary planning application for South Korea. Built with Node.js, Express, TypeScript, and MongoDB.

## 🛠 Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js 5.1
- **Database:** MongoDB with Mongoose
- **Language:** TypeScript 5.9
- **Authentication:** JWT, Passport.js (Google OAuth)
- **Session Management:** Express Session with MongoDB Store
- **Validation:** Zod
- **Logging:** Winston
- **Caching:** NodeCache
- **HTTP Client:** Axios
- **Code Quality:** ESLint, Prettier

## ✨ Features

### Core Modules

- **🔐 Authentication** - Email/password and Google OAuth authentication
- **👤 User Management** - User profiles and account management
- **🔍 Location Search** - Hybrid search using Naver Maps and Kakao APIs with Korean-to-English translation
- **🗺️ AI Itinerary Planner** - AI-powered trip planning using Naver HyperCLOVA
- **📍 Route Mapping** - Route calculation and visualization using Naver Maps Direction API
- **📝 Reviews & Analysis** - Location reviews and blog content analysis
- **🖼️ Image Analysis** - AI-powered image recognition for location identification

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── config/                # Configuration files
│   │   ├── logger.ts          # Winston logger setup
│   │   └── passport.setup.ts  # Passport authentication config
│   ├── database/              # Database connection
│   │   └── connection.ts      # MongoDB connection
│   ├── middlewares/           # Custom middlewares
│   │   ├── errorHandler.ts    # Global error handler
│   │   └── validate.ts        # Request validation middleware
│   ├── modules/               # Feature modules
│   │   ├── auth/             # Authentication module
│   │   ├── user/             # User management
│   │   ├── search/           # Location search (Naver + Kakao)
│   │   ├── planner/          # AI itinerary planning
│   │   ├── mapper/           # Route mapping & directions
│   │   ├── review/            # Reviews & content analysis
│   │   └── analyze-image/    # Image analysis
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
│       ├── prompts/          # AI prompts for itinerary generation
│       ├── parseItinerary.ts # Itinerary parsing utilities
│       └── cleanText.ts      # Text cleaning utilities
├── dist/                      # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── Dockerfile
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20 or higher
- **MongoDB** (local or cloud instance)
- **npm** or **yarn**
- API Keys for:
  - Naver Cloud Platform (Maps, HyperCLOVA, Papago)
  - Kakao Developers (Local API)
  - Google OAuth (optional, for Google login)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd travista/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see [Environment Variables](#-environment-variables))

5. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000` (or the port specified in `PORT`).

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

### Required Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/travista

# Session Secret
SESSION_SECRET=your-super-secret-session-key-here

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000

# Naver Cloud Platform - Maps API
NAVER_MAPS_CLIENT_ID=your-naver-maps-client-id
NAVER_MAPS_CLIENT_SECRET=your-naver-maps-client-secret

# Naver Cloud Platform - HyperCLOVA (AI)
NCP_API_KEY=your-ncp-api-key

# Naver Cloud Platform - Papago Translation (optional)
X_NCP_APIGW_API_KEY_ID=your-papago-key-id
X_NCP_APIGW_API_KEY=your-papago-api-key

# Kakao Developers - Local API (optional, for search fallback)
KAKAO_REST_API_KEY=your-kakao-rest-api-key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Getting API Keys

1. **Naver Cloud Platform**
   - Sign up at [https://www.ncloud.com](https://www.ncloud.com)
   - Enable Maps API, HyperCLOVA, and Papago Translation services
   - Create API keys in the console

2. **Kakao Developers**
   - Sign up at [https://developers.kakao.com](https://developers.kakao.com)
   - Create an application and enable "Local" API
   - Get REST API key

3. **Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth initiation
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Location Search
- `GET /api/search/location?keyword=<query>` - Search locations
  - Supports both Korean and English queries
  - Returns results from Naver Maps and Kakao APIs
  - Automatically translates Korean results to English

### Itinerary Planning
- `POST /api/planner/create-itinerary` - Generate AI-powered itinerary
  - Request body includes: destination, startDate, numberOfDays, people, budget, theme
  - Returns optimized travel itinerary with attractions and restaurants

### Route Mapping
- `POST /api/mapper/draw-route` - Calculate route between locations
- `POST /api/mapper/validate-itinerary-duration` - Validate itinerary duration

### Reviews & Analysis
- `GET /api/reviews/summary` - Get location reviews and summaries
- `POST /api/reviews/analyze` - Analyze blog content for locations

### Image Analysis
- `POST /api/analyze` - Analyze image to identify location

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Build
npm run build        # Compile TypeScript to JavaScript

# Production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run prettier     # Check code formatting
npm run prettier:fix # Fix code formatting
```

### Development Workflow

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **The server will:**
   - Watch for file changes and auto-reload
   - Connect to MongoDB automatically
   - Log requests using Morgan
   - Show detailed error messages

### Code Structure

Each module follows a consistent structure:
```
module/
├── module.controller.ts  # Request/response handling
├── module.service.ts     # Business logic
├── module.route.ts       # Route definitions
├── module.model.ts       # Mongoose models (if needed)
├── module.validation.ts  # Zod validation schemas
└── module.type.ts        # TypeScript types
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t travista-backend .
```

### Run Container

```bash
docker run -p 5000:5000 \
  -e MONGO_URI=your-mongo-uri \
  -e SESSION_SECRET=your-secret \
  -e NAVER_MAPS_CLIENT_ID=your-id \
  -e NAVER_MAPS_CLIENT_SECRET=your-secret \
  travista-backend
```

Or use Docker Compose (create `docker-compose.yml`):

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/travista
      - SESSION_SECRET=your-secret
      # ... other env vars
    depends_on:
      - mongo
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
```

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Configured for specific origins
- **Session Management** - Secure session storage in MongoDB
- **JWT Authentication** - Token-based authentication
- **Input Validation** - Zod schema validation
- **Error Handling** - Centralized error handling middleware

## 📊 Caching

- **Search Results** - Cached for 24 hours using NodeCache
- **Route Data** - Cached in MongoDB for frequently accessed routes

## ⚠️ Important Notes

### Server Timeouts

The server is configured with extended timeouts for AI generation:
- **Server timeout:** 5 minutes (300 seconds)
- **Keep-alive timeout:** 65 seconds
- **Headers timeout:** 66 seconds

This allows the AI itinerary generation process to complete without timing out.

### API Rate Limits

Be aware of rate limits for external APIs:
- **Naver Cloud Platform** - Check your plan limits
- **Kakao API** - Free tier has daily limits
- **Google OAuth** - Standard OAuth limits apply

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and formatting: `npm run lint:fix && npm run prettier:fix`
4. Test your changes
5. Submit a pull request

## 📝 License

MIT

## 🆘 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check `MONGO_URI` is correct
- Verify network connectivity

### API Key Errors
- Verify all required API keys are set in `.env`
- Check API key permissions in respective developer consoles
- Ensure API services are enabled

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process using the port: `lsof -ti:5000 | xargs kill`

### Build Errors
- Clear `dist/` folder: `rm -rf dist`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript version compatibility
