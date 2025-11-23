# Travista 🗺️

**Travista** is an AI-powered travel itinerary planning application specifically designed for South Korea. It helps travelers create optimized, personalized travel plans using artificial intelligence, real-time location data, and interactive maps.

## ✨ Features

- **🤖 AI-Powered Planning** - Generate complete travel itineraries using Naver HyperCLOVA AI
- **🔍 Smart Location Search** - Hybrid search using Naver Maps and Kakao APIs with Korean-to-English translation
- **🗺️ Interactive Maps** - Naver Maps integration with 3D aerial view and route visualization
- **📍 Route Optimization** - Automatically calculate optimal routes between destinations
- **📝 Location Reviews** - AI-generated summaries and reviews for attractions and restaurants
- **🖼️ Image Recognition** - Upload images to identify locations using AI
- **🔐 User Authentication** - Email/password and Google OAuth login
- **📱 Responsive Design** - Fully responsive, mobile-first design
- **🌐 Multi-language Support** - Supports both Korean and English queries

## 🏗️ Architecture

Travista is built as a full-stack application with a clear separation between frontend and backend:

```
travista/
├── frontend/          # Next.js 15 frontend application
├── backend/           # Express.js backend API
└── README.md          # This file
```

### Tech Stack Overview

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Naver Maps API
- Zustand (State Management)

**Backend:**
- Node.js 20+
- Express.js 5
- TypeScript
- MongoDB with Mongoose
- Naver HyperCLOVA AI
- Naver Maps API
- Kakao Local API
- Papago Translation API

## 🚀 Quick Start

### Prerequisites

- **Node.js** v20 or higher
- **MongoDB** (local or cloud instance like MongoDB Atlas)
- **npm** or **yarn**
- **API Keys** (see [API Setup](#-api-setup))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd travista
   ```

2. **Install dependencies for both frontend and backend**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   - Backend: Create `backend/.env` (see [Backend README](./backend/README.md#-environment-variables))
   - Frontend: Create `frontend/.env.local` (see [Frontend README](./frontend/README.md#-environment-variables))

4. **Start the development servers**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔑 API Setup

Travista requires API keys from several services:

### Required APIs

1. **Naver Cloud Platform**
   - **Maps API** - For geocoding and route calculation
   - **HyperCLOVA** - For AI itinerary generation
   - **Papago Translation** - For Korean-to-English translation (optional but recommended)
   
   Sign up at: [https://www.ncloud.com](https://www.ncloud.com)

2. **Kakao Developers**
   - **Local API** - For location search fallback
   
   Sign up at: [https://developers.kakao.com](https://developers.kakao.com)

### Optional APIs

3. **Google OAuth**
   - For Google login functionality
   
   Setup at: [Google Cloud Console](https://console.cloud.google.com)

### Environment Variables Summary

**Backend (`backend/.env`):**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/travista
SESSION_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
NAVER_MAPS_CLIENT_ID=your-id
NAVER_MAPS_CLIENT_SECRET=your-secret
NCP_API_KEY=your-ncp-key
X_NCP_APIGW_API_KEY_ID=your-papago-id
X_NCP_APIGW_API_KEY=your-papago-key
KAKAO_REST_API_KEY=your-kakao-key
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_NODE_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID=your-naver-maps-id
```

For detailed setup instructions, see:
- [Backend Environment Variables](./backend/README.md#-environment-variables)
- [Frontend Environment Variables](./frontend/README.md#-environment-variables)

## 📁 Project Structure

```
travista/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── modules/        # Feature modules (auth, planner, mapper, etc.)
│   │   ├── config/         # Configuration files
│   │   ├── database/       # MongoDB connection
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── README.md           # Backend documentation
│
├── frontend/               # Frontend Next.js application
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   ├── services/      # API service layer
│   │   ├── hooks/        # Custom React hooks
│   │   └── contexts/      # React contexts
│   ├── package.json
│   └── README.md          # Frontend documentation
│
└── README.md              # This file
```

## 🎯 Core Workflows

### 1. User Registration & Authentication
- Users can register with email/password or use Google OAuth
- JWT tokens stored in localStorage
- Session management via Express Session

### 2. Itinerary Planning Flow
1. User enters destination, dates, duration, group size, budget, and theme
2. Frontend sends request to backend `/api/planner/create-itinerary`
3. Backend:
   - Fetches tourist attractions from Kakao API
   - Fetches restaurants from Kakao API
   - Calculates distance matrices using Naver Maps
   - Generates optimized itinerary using Naver HyperCLOVA AI
   - Calculates routes and saves to database
4. Frontend displays interactive map with itinerary

### 3. Location Search Flow
1. User types location in search input
2. Frontend queries `/api/search/location?keyword=...`
3. Backend:
   - Searches Naver Maps API
   - If few results, searches Kakao API as fallback
   - Translates Korean results to English using Papago
   - Returns merged, deduplicated results
4. Results displayed in dropdown with debouncing

### 4. Route Visualization
- Interactive Naver Map shows all itinerary stops
- Route paths drawn between locations
- Markers for attractions and restaurants
- Click markers to see details

## 🛠️ Development

### Running in Development Mode

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

### Code Quality

Both projects use ESLint and Prettier:

**Backend:**
```bash
cd backend
npm run lint:fix
npm run prettier:fix
```

**Frontend:**
```bash
cd frontend
npm run lint
```

## 🐳 Docker Deployment

### Backend

```bash
cd backend
docker build -t travista-backend .
docker run -p 5000:5000 travista-backend
```

### Frontend

```bash
cd frontend
docker build -t travista-frontend .
docker run -p 3000:3000 travista-frontend
```

### Docker Compose (Full Stack)

Create `docker-compose.yml` in root:

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/travista
      - SESSION_SECRET=your-secret
      # ... other env vars
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_NODE_API_URL=http://backend:5000
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
      # ... other env vars
    depends_on:
      - backend

volumes:
  mongo_data:
```

Run with:
```bash
docker-compose up
```

## 📚 Documentation

- **[Backend README](./backend/README.md)** - Complete backend documentation
  - API endpoints
  - Environment variables
  - Database models
  - Development guide

- **[Frontend README](./frontend/README.md)** - Complete frontend documentation
  - Component structure
  - Styling guide
  - API integration
  - Deployment guide

## 🔒 Security

- **Authentication:** JWT tokens with secure session management
- **CORS:** Configured for specific origins
- **Helmet.js:** Security headers on backend
- **Input Validation:** Zod schemas for request validation
- **Environment Variables:** Sensitive data stored in `.env` files

## 📊 Performance

- **Caching:** Search results cached for 24 hours
- **Code Splitting:** Automatic with Next.js App Router
- **Image Optimization:** Next.js Image component
- **API Timeouts:** Extended timeouts for AI generation (3 minutes)
- **Lazy Loading:** Components loaded on demand

## 🧪 Testing

Currently, the project focuses on development. Testing infrastructure can be added:

- **Backend:** Jest for unit and integration tests
- **Frontend:** React Testing Library for component tests
- **E2E:** Playwright for end-to-end testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting and formatting
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- **TypeScript:** Strict mode enabled
- **ESLint:** Configured for both projects
- **Prettier:** Consistent code formatting
- **Conventional Commits:** Recommended commit message format

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB is running
- Verify all environment variables are set
- Check port 5000 is not in use

**Frontend won't connect to backend:**
- Verify `NEXT_PUBLIC_NODE_API_URL` is correct
- Check backend is running
- Verify CORS configuration

**Map not loading:**
- Check `NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID` is set
- Verify domain is whitelisted in Naver Maps console
- Check browser console for errors

**AI generation times out:**
- Backend timeout is set to 5 minutes
- Frontend timeout is set to 3 minutes
- Check API rate limits

For more troubleshooting, see:
- [Backend Troubleshooting](./backend/README.md#-troubleshooting)
- [Frontend Troubleshooting](./frontend/README.md#-troubleshooting)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API documentation in respective README files

## 🗺️ Roadmap

- [ ] Add unit and integration tests
- [ ] Implement offline mode
- [ ] Add more language support
- [ ] Enhance AI prompt engineering
- [ ] Add social sharing features
- [ ] Implement itinerary export (PDF, etc.)
- [ ] Add user reviews and ratings
- [ ] Implement itinerary templates

## 🙏 Acknowledgments

- **Naver Cloud Platform** - Maps, AI, and Translation APIs
- **Kakao Developers** - Local API for location search
- **Next.js** - Amazing React framework
- **Express.js** - Robust Node.js framework
- **All Contributors** - Thank you for your contributions!

---

**Made with ❤️ for travelers exploring South Korea**

