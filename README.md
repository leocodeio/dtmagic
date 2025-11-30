# DTMagic - Student-Faculty Engagement Platform

A mobile application designed to improve student-faculty interaction and engagement through organized events and activities. Built with Expo (React Native) and a Node.js/Express/MongoDB backend.

## 🎯 Project Vision

DTMagic aims to bridge the gap between students and faculty by creating a platform where both can participate in various engagement activities. The system tracks participation, manages events, and rewards students with incentive points for their involvement.

## ✨ Features

### Authentication
- **Role-Based Login**: Separate login flows for Students and Faculty (dropdown selector)
- **Secure Sessions**: JWT-based authentication with secure token storage
- **Separate User Tables**: Distinct database tables for Students and Faculty

### Dashboard
- **Showcase Icons**: Multiple icons displayed for future features
- **Engagement Button**: Primary feature - navigates to the Engagement page

### Engagement System
- **Event Listing**: View upcoming events enabled by the admin
- **Event Categories (Niches)**:
  - 🎮 Gaming
  - 🎤 Singing
  - 💃 Dancing
  - 💻 Coding
  - *(more categories can be added)*
- **Event Selection**: Both faculty and students can select their preferred events/niches
- **Participation Tracking**: Backend stores who selected which events

### Admin Management
- **Event Configuration**: Admin manages events via backend file editing
- **Venue & Timing**: Admin sets event location and schedule
- **Capacity Management**: Admin defines maximum participants per event

### Incentive System
- **Student Rewards**: Incentive points awarded for event participation
- **Point Tracking**: Points mapped to student IDs in a dedicated table
- **Participation History**: Track student engagement across all events

## 📱 App Flow

```
┌─────────────────┐
│   Login Screen  │
│ ┌─────────────┐ │
│ │Role Dropdown│ │
│ │ - Student   │ │
│ │ - Faculty   │ │
│ └─────────────┘ │
│  Email/Password │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Dashboard    │
│                 │
│ [Icon] [Icon]   │
│ [Icon] [Icon]   │
│                 │
│ [🎯 Engagement] │◄── Main Feature
│                 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Engagement Page │
│                 │
│ Upcoming Events │
│ ┌─────────────┐ │
│ │ Event 1     │ │
│ │ Event 2     │ │
│ └─────────────┘ │
│                 │
│ Select Niche:   │
│ [Gaming]        │
│ [Singing]       │
│ [Dancing]       │
│ [Coding]        │
│                 │
│ [Submit Choice] │
└─────────────────┘
```

## 🗄️ Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `students` | Student user accounts and profiles |
| `faculty` | Faculty/teacher user accounts and profiles |
| `events` | Event details (name, venue, timing, capacity) |
| `participations` | Records of who selected which events |
| `incentives` | Student incentive points tracking |

### Incentive Points Structure
```
StudentID → IncentivePoints (number)
         → ParticipatedEvents (array)
```

## 📁 Project Structure

```
├── api/                    # Backend API (Node.js + Express + MongoDB + TypeScript)
│   ├── src/
│   │   ├── index.ts       # Server entry point
│   │   ├── config/        # Database configuration
│   │   ├── types/         # TypeScript type definitions
│   │   ├── models/        # MongoDB models (Student, Faculty, Event, etc.)
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth middleware
│   │   ├── data/          # Admin-managed event data files
│   │   └── scripts/       # Utility scripts (seed users)
├── app/                   # Expo app screens
│   ├── login.tsx         # Login screen with role selector
│   ├── (tabs)/
│   │   ├── index.tsx     # Dashboard
│   │   └── engagement.tsx # Engagement page
├── server/                # Frontend API functions
│   ├── auth.ts           # Authentication functions
│   └── session.ts        # Session/token management
├── utils/
│   └── axios.instance.ts # Axios configuration
└── ...
```

## 🚀 Getting Started

### 1. Setup the Backend API

```bash
cd api
npm install
```

Create a `.env` file in the `api` folder:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/dtmagic
JWT_SECRET=your-super-secret-jwt-key
```

Seed initial users:
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

Set your API URL in `.env`:
```
EXPO_PUBLIC_API_URL=http://your-ip-address:3001
```

Start the Expo app:
```bash
npx expo start
```

## 👥 User Roles

| Role | Description | Capabilities |
|------|-------------|--------------|
| **Student** | Student users | View events, select niches, earn incentive points |
| **Faculty** | Faculty/teachers | View events, select niches, participate in engagements |
| **Admin** | Backend admin | Manage events via file editing, set venues/timings |

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (with role selection) |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/verify` | Verify token validity |

### Events (To be implemented)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List upcoming events |
| GET | `/api/events/:id` | Get event details |
| POST | `/api/events/:id/participate` | Register for an event |

### Incentives (To be implemented)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/incentives/me` | Get current user's incentive points |
| GET | `/api/incentives/leaderboard` | View top participants |

## 🛠️ Tech Stack

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

## 📊 Future Enhancements

- [ ] Real-time event notifications
- [ ] Event feedback/rating system
- [ ] Faculty-specific dashboard analytics
- [ ] Incentive points redemption system
- [ ] Event photo gallery
- [ ] Chat/messaging between participants

## 🎓 Purpose

This project is designed to **improve student-faculty interaction** at educational institutions by:
- Encouraging participation in extracurricular activities
- Creating shared experiences beyond the classroom
- Rewarding student engagement with incentive points
- Giving faculty confidence in student involvement
- Building a stronger campus community

---

## Development

- Frontend runs on Expo dev server
- Backend runs on port 3001 by default
- MongoDB should be running locally or configure a remote URI
