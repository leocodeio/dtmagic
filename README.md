# DTMagic - Simple Login Mobile App

A minimalist mobile application with email/password authentication. Built with Expo (React Native) and a Node.js/Express/MongoDB backend.

## Features

- **Simple Login**: Email and password authentication (no signup)
- **Secure Sessions**: JWT-based authentication with secure token storage
- **Cross-Platform**: Runs on iOS, Android, and Web

## Project Structure

```
├── api/                    # Backend API (Node.js + Express + MongoDB + TypeScript)
│   ├── src/
│   │   ├── index.ts       # Server entry point
│   │   ├── types/         # TypeScript type definitions
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth middleware
│   │   └── scripts/       # Utility scripts (seed users)
├── app/                   # Expo app screens
├── server/                # Frontend API functions
│   ├── auth.ts           # Authentication functions
│   └── session.ts        # Session/token management
├── utils/
│   └── axios.instance.ts # Axios configuration
└── ...
```

## Getting Started

### 1. Setup the Backend API

```bash
cd api
npm install
```

Create a `.env` file in the `api` folder:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/dtmagic
JWT_SECRET=your-super-secret-jwt-key
```

Seed initial users (since there's no signup):
```bash
npm run seed
```

Start the API server:
```bash
npm run dev
```

### 2. Setup the Mobile App

```bash
# From the root directory
npm install
```

Set your API URL (optional, defaults to localhost:3000):
- Create a `.env` file with: `EXPO_PUBLIC_API_URL=http://your-api-url:3000`

Start the Expo app:
```bash
npx expo start
```

## Default Credentials

After running the seed script, you can login with:

**Student:**
- **Email**: student@dtmagic.com
- **Password**: student123

**Faculty:**
- **Email**: faculty@dtmagic.com
- **Password**: faculty123

## User Roles

The app supports two user roles:
- **student** - Student users
- **faculty** - Faculty/teacher users

## API Endpoints

| Method | Endpoint        | Description                    |
|--------|-----------------|--------------------------------|
| POST   | /api/auth/login | Login with email and password  |
| GET    | /api/auth/me    | Get current user (auth required) |
| POST   | /api/auth/logout| Logout (auth required)         |
| GET    | /api/health     | Health check                   |

## Tech Stack

**Frontend:**
- Expo / React Native
- TypeScript
- Axios
- Expo SecureStore

**Backend:**
- Node.js
- Express
- MongoDB / Mongoose
- JWT Authentication
- bcryptjs

## Development

- Frontend runs on Expo dev server
- Backend runs on port 3000 by default
- MongoDB should be running locally or configure a remote URI
