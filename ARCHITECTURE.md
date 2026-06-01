# CivicFix Architecture Documentation

This document provides a detailed overview of the CivicFix system architecture, design patterns, and technical decisions.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Database Schema](#database-schema)
6. [Authentication & Security](#authentication--security)
7. [API Design](#api-design)
8. [AI Integration](#ai-integration)
9. [Deployment](#deployment)
10. [Scalability Considerations](#scalability-considerations)

---

## System Overview

CivicFix is a **three-tier distributed system** with:

```
┌─────────────────────────────────────────────────────┐
│             Frontend Layer                           │
│  ┌──────────────────────┬──────────────────────┐    │
│  │  Mobile App (Expo)   │  Web Dashboard       │    │
│  │  React Native + JS   │  React + Vite        │    │
│  └──────────────────────┴──────────────────────┘    │
└─────────────────────────────────────────────────────┘
              ↓ REST API (JSON/HTTP) ↓
┌─────────────────────────────────────────────────────┐
│             Backend API Layer                        │
│  ┌──────────────────────────────────────────────┐   │
│  │  Express.js Server (Node.js)                 │   │
│  │  • Auth Controller                           │   │
│  │  • Issue Controller                          │   │
│  │  • Team Controller                           │   │
│  │  • AI Service (Google Genai)                 │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
              ↓ SQL Queries / Auth ↓
┌─────────────────────────────────────────────────────┐
│             Data & Auth Layer                        │
│  ┌──────────────────────────────────────────────┐   │
│  │  Supabase (PostgreSQL + GoTrue)              │   │
│  │  • User Profiles & Auth                      │   │
│  │  • Issues Table                              │   │
│  │  • Comments & Updates                        │   │
│  │  • Team Members & Roles                      │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Architecture Diagram

### Request Flow

```
User Action (Mobile/Web)
    ↓
React Component / Expo Screen
    ↓
API Service (axios/fetch)
    ↓
Express Route Handler
    ↓
Authentication Middleware
    ↓
Business Logic (Service Layer)
    ↓
Supabase Client (SQL)
    ↓
PostgreSQL Database
    ↓
Response (JSON)
    ↓
State Update (UI Re-render)
```

### Data Flow with AI

```
Issue Created
    ↓
Issue data sent to backend
    ↓
AI Service triggered
    ↓
Google Genai API (Categorization)
    ↓
Categories stored in database
    ↓
Dashboard displays with AI label
```

---

## Backend Architecture

### Core Components

#### 1. **Express Application** (`src/app.js`)

```javascript
// Middleware stack
app.use(express.json({ limit: '50mb' }))        // Large file uploads
app.use(CORS middleware)                         // Cross-origin requests
app.use(Express routes)                          // Route handlers
```

**Features:**
- Increased payload limit (50MB) for base64 encoded images
- CORS enabled for mobile and web clients
- Modular route structure

#### 2. **Route Layer** (`src/routes/`)

Each feature has dedicated routes:

- **authRoutes.js** – `/api/auth/` endpoints
- **issueRoutes.js** – `/api/issues/` endpoints
- **commentRoutes.js** – `/api/comments/` endpoints
- **teamRoutes.js** – `/api/team/` endpoints
- **assistantRoutes.js** – `/api/assistant/` endpoints
- **aiRoutes.js** – `/api/ai/` AI features

#### 3. **Controller Layer** (`src/controllers/`)

Handles request/response logic:

```javascript
// Example: Issue Controller
export const createIssue = async (req, res) => {
  const { title, description, latitude, longitude, photos } = req.body;
  // 1. Validate input
  // 2. Store in database
  // 3. Trigger AI analysis
  // 4. Return response
};
```

**Responsibilities:**
- Parse request data
- Call service methods
- Handle errors
- Return formatted responses

#### 4. **Service Layer** (`src/services/`)

Business logic abstraction:

```javascript
// Issue Service
export const issueService = {
  createIssue: (data) => { /* DB logic */ },
  getIssue: (id) => { /* DB logic */ },
  updateIssueStatus: (id, status) => { /* DB logic */ },
  listIssues: (filters) => { /* DB logic */ },
  getIssuesNearby: (lat, lon, radius) => { /* Geo query */ }
};

// AI Service
export const aiService = {
  categorizeIssue: (description) => { /* Google Genai */ },
  summarizeIssue: (description) => { /* Google Genai */ },
  generateSuggestions: (issue) => { /* Google Genai */ }
};
```

**Advantages:**
- Reusable logic
- Easy testing
- Clear separation of concerns

#### 5. **Authentication Middleware** (`src/middlewares/authMiddleware.js`)

```javascript
// Verify JWT token
export const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  // Verify with Supabase
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).json({ error: 'Invalid token' });
  
  req.user = data.user;
  next();
};

// Optional authentication (for public/auth hybrid)
export const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const { data } = await supabase.auth.getUser(token);
      req.user = data.user;
    } catch (error) {
      // Proceed without auth
    }
  }
  next();
};
```

#### 6. **Database Configuration** (`src/config/supabaseClient.js`)

```javascript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

---

## Frontend Architecture

### Mobile App (React Native + Expo)

#### Structure

```
App.jsx (Root Component)
├── State Management (useState, useContext)
├── Navigation Logic
└── Main Screens
    ├── Auth Stack
    │   ├── Login
    │   └── Signup
    └── Tab Stack
        ├── Feeds (Home)
        ├── Create Issue
        ├── Notifications
        └── Assistant
```

#### Key Components

| Component | Purpose |
|-----------|---------|
| `Feeds.jsx` | Feed tabs (For You, My Posts, Updates) |
| `Post.jsx` | Issue detail view + comments + timeline |
| `CreatePost.jsx` | Issue reporting form |
| `IssueCard.jsx` | Individual issue card |
| `CommentForm.jsx` | Comment input |
| `CivicAssistant.jsx` | AI chat interface |
| `Login.jsx` | Auth UI |
| `Signup.jsx` | Registration UI |

#### State Management Pattern

```javascript
// App.jsx
const [issues, setIssues] = useState([]);
const [currentUser, setCurrentUser] = useState(null);
const [selectedIssue, setSelectedIssue] = useState(null);

useEffect(() => {
  // Fetch initial data
  fetchIssues();
  checkAuth();
}, []);

// Pass down via props or Context API
```

#### API Integration

```javascript
// config.js
export const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_BASE_URL || 
  'http://localhost:5001/api';

// services/api.js
export const fetchIssues = async () => {
  const response = await fetch(`${API_BASE_URL}/issues`);
  return response.json();
};
```

### Web Dashboard (React + Vite)

#### Structure

```
src/
├── pages/
│   ├── Landing.jsx (public)
│   ├── Login.jsx
│   ├── Dashboard.jsx (stats)
│   ├── Issues.jsx (kanban)
│   ├── IssueDetail.jsx
│   ├── Map.jsx
│   ├── Reports.jsx
│   └── Team.jsx (admin)
├── context/
│   └── AuthContext.jsx
├── layouts/
│   └── AppLayout.jsx
├── services/
│   ├── api.js
│   ├── issuesService.js
│   └── teamService.js
└── index.css (Tailwind v4)
```

#### Context API for Auth

```javascript
// AuthContext.jsx
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signIn = async (email, password) => {
    const response = await api.login(email, password);
    localStorage.setItem('token', response.token);
    setUser(response.user);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Usage in components
const useAuth = () => useContext(AuthContext);
```

#### Kanban Board Implementation

Uses `@hello-pangea/dnd` for drag-and-drop:

```javascript
// Issues.jsx
const [issues, setIssues] = useState([]);

const handleDragEnd = async (result) => {
  const { source, destination, draggableId } = result;
  
  if (!destination) return;
  
  const newStatus = destination.droppableId;
  
  // Update backend
  await issuesService.updateStatus(draggableId, newStatus);
  
  // Update UI
  setIssues(/* reorganized array */);
};

return (
  <DragDropContext onDragEnd={handleDragEnd}>
    {statusColumns.map(status => (
      <Droppable key={status} droppableId={status}>
        {/* Render draggable issues */}
      </Droppable>
    ))}
  </DragDropContext>
);
```

---

## Database Schema

### Key Tables

#### `auth.users` (Supabase Auth)
- `id` (UUID) – User identifier
- `email` (Text) – Email address
- `encrypted_password` – Password hash
- `email_confirmed_at` – Verification timestamp

#### `public.issues`
```sql
CREATE TABLE issues (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  status issue_status DEFAULT 'reported',  -- enum
  verification_status verification_status,
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  votes_count INT DEFAULT 0,
  ai_category TEXT,          -- AI-detected category
  ai_summary TEXT,           -- AI-generated summary
  photos JSONB DEFAULT '[]'  -- Array of photo URLs
);
```

#### `public.comments`
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  issue_id UUID NOT NULL REFERENCES issues(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `public.issue_updates`
```sql
CREATE TABLE issue_updates (
  id UUID PRIMARY KEY,
  issue_id UUID NOT NULL REFERENCES issues(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status_before issue_status,
  status_after issue_status,
  description TEXT,
  photos JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `public.organization_members`
```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL,  -- 'admin', 'officer', 'contractor'
  verified BOOLEAN DEFAULT FALSE,
  access_requested BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Key Queries

**Get nearby issues (geolocation):**
```sql
SELECT * FROM issues
WHERE ST_DWithin(
  ST_MakePoint(longitude, latitude)::geography,
  ST_MakePoint(?, ?)::geography,
  ? -- radius in meters
)
ORDER BY created_at DESC;
```

**Get issue with all related data:**
```sql
SELECT 
  i.*,
  json_agg(json_build_object('id', c.id, 'content', c.content, 'user', u.email))
    FILTER (WHERE c.id IS NOT NULL) as comments,
  json_agg(json_build_object('id', u2.id, 'status', u2.status_after))
    FILTER (WHERE u2.id IS NOT NULL) as updates
FROM issues i
LEFT JOIN comments c ON c.issue_id = i.id
LEFT JOIN issue_updates u2 ON u2.issue_id = i.id
WHERE i.id = ?
GROUP BY i.id;
```

---

## Authentication & Security

### JWT Flow

```
User Login
    ↓
POST /api/auth/login (email, password)
    ↓
Backend verifies with Supabase
    ↓
Supabase returns JWT token
    ↓
Backend returns token to client
    ↓
Client stores in localStorage (web) or AsyncStorage (mobile)
    ↓
Client includes in Authorization header for future requests
    ↓
Backend verifies token on each request
    ↓
If valid → proceed; if invalid → return 401
```

### Token Structure

```javascript
// JWT Payload (decoded)
{
  sub: "user-uuid",                    // Subject (user ID)
  aud: "authenticated",                 // Audience
  iat: 1234567890,                      // Issued at
  exp: 1234571490,                      // Expires at (30 min)
  email: "user@example.com",
  email_verified: true,
  phone_verified: false,
  app_metadata: { provider: "email", ... },
  user_metadata: { ... }
}
```

### Security Best Practices

1. **Never expose service role key in frontend** – Only use anon key
2. **Use HTTPS in production** – Encrypt all data in transit
3. **Supabase Row-Level Security** – Restrict data access at DB level
4. **Rate limiting** – Implement on sensitive endpoints (/login, /api/ai)
5. **CORS configuration** – Only allow trusted origins
6. **Input validation** – Sanitize all user inputs
7. **Error handling** – Don't expose database errors to clients

---

## API Design

### Request/Response Format

**Standard Request:**
```json
{
  "title": "Pothole on Main Street",
  "description": "Large pothole at intersection",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "photos": ["base64_encoded_image_1", "base64_encoded_image_2"]
}
```

**Standard Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "issue-uuid",
    "title": "Pothole on Main Street",
    "status": "reported",
    "created_at": "2026-05-22T10:30:00Z",
    "ai_category": "infrastructure",
    "ai_summary": "Pothole blocking traffic flow"
  }
}
```

**Standard Response (Error):**
```json
{
  "success": false,
  "error": "Unauthorized",
  "code": "AUTH_001",
  "details": "JWT token expired"
}
```

### Pagination

```javascript
GET /api/issues?page=1&limit=20&sort=created_at&order=desc

Response:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Filtering

```javascript
GET /api/issues?status=reported&city=NewYork&category=pothole
```

---

## AI Integration

### Google Genai API

**Service:** Google Generative AI (Gemini)

**Features Used:**
1. **Issue Categorization** – Classify issue type
2. **Summary Generation** – Create concise summary
3. **Suggestion Engine** – Recommend solutions

### Categorization Example

```javascript
const aiService = {
  categorizeIssue: async (description) => {
    const model = genai.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Categorize this civic issue into one of these categories: 
    pothole, streetlight, water, waste, tree, other.
    
    Issue: "${description}"
    
    Respond with ONLY the category name.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
};
```

### Rate Limiting for AI

```javascript
// Max 10 AI requests per user per hour
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10,
  keyGenerator: (req) => req.user.id
});

app.post('/api/ai/categorize', aiRateLimiter, (req, res) => { ... });
```

---

## Deployment

### Backend Deployment (Railway/Render/Heroku)

```bash
# Set environment variables in dashboard:
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_API_KEY
PORT=5001

# Deploy
git push heroku main
```

### Frontend Deployment

**Web Dashboard (Vercel):**
```bash
npm run build
vercel deploy
```

**Mobile App (EAS Build):**
```bash
eas build --platform ios
eas build --platform android
eas submit --platform ios
eas submit --platform android
```

---

## Scalability Considerations

### Database Optimization

1. **Indexing:**
   ```sql
   CREATE INDEX idx_issues_status ON issues(status);
   CREATE INDEX idx_issues_location ON issues USING GIST(ST_MakePoint(longitude, latitude)::geography);
   CREATE INDEX idx_comments_issue ON comments(issue_id);
   ```

2. **Partitioning (future):**
   - Partition issues by month for faster queries
   - Archive old issues to separate table

3. **Caching:**
   - Use Redis for issue statistics
   - Cache AI summaries (5-10 min TTL)

### API Optimization

1. **Query Optimization:**
   - Use pagination for large result sets
   - Select only needed columns
   - Lazy-load related data

2. **Compression:**
   - Enable gzip for responses
   - Compress images before upload

3. **CDN:**
   - Serve static assets via CDN
   - Cache issue photos on Cloudinary/similar

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:5001/api/issues

# Using Artillery
artillery quick --count 100 --num 10 http://localhost:5001/api/issues
```

---

## Monitoring & Logging

### Backend Logging

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

logger.info(`Issue ${issueId} created by ${userId}`);
logger.error(`Failed to process AI request: ${error}`);
```

### Performance Monitoring

- Use Supabase dashboard for query performance
- Monitor API response times
- Track error rates and user adoption

---

## Future Enhancements

1. **Real-time Updates** – WebSocket integration (Socket.io)
2. **Push Notifications** – Firebase Cloud Messaging
3. **Advanced Analytics** – Time-to-resolution tracking
4. **Mobile App Store Release** – TestFlight → App Store
5. **Integration with govt systems** – Legacy IMIS/MIS systems
6. **ML Model** – Predictive maintenance suggestions
7. **Multi-language Support** – i18n implementation

---

**Last Updated:** May 22, 2026  
**Version:** 1.0.0
