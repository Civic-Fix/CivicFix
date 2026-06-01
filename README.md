# CivicFix – Smart Civic Complaint Management System

## 🎯 Vision & Mission

### Vision
To revolutionize civic governance by creating a transparent, data-driven platform that empowers citizens to voice concerns and enables municipal authorities to respond efficiently and equitably to community needs.

### Mission
CivicFix bridges the gap between citizens and government by:
- **Empowering Citizens**: Providing an accessible, mobile-first platform to report and track civic issues with real-time transparency
- **Enabling Authorities**: Equipping municipal officers with tools to triage, assign, and resolve issues efficiently using intelligent workflows
- **Building Trust**: Creating an auditable, transparent system where every issue has a documented lifecycle from report to resolution
- **Leveraging Technology**: Integrating AI-powered assistance and geospatial visualization to prioritize and understand civic challenges at scale

---

## 📋 Project Overview

CivicFix is a centralized platform that streamlines reporting, managing, and resolving civic issues across multiple municipalities. It connects **citizens, municipal officers, and field contractors** into a single transparent ecosystem where:

1. **Citizens** report civic issues (potholes, water leaks, streetlight outages, etc.) via a mobile app, with photo evidence and GPS location
2. **Municipal Officers** review, verify, assign, and track issue resolution through an intelligent Kanban-based dashboard
3. **Field Contractors** execute repairs and provide real-time progress updates
4. **Administrators** monitor trends, manage team access, and generate performance analytics

### Key Innovation Points
- **Community Voting**: Citizens upvote/downvote issues to surface priority problems organically
- **AI-Powered Insights**: Google Gemini integration provides contextual suggestions and smart categorization
- **Geospatial Mapping**: Visualize all issues on interactive maps for better resource allocation
- **Transparent Workflows**: Full audit trail from report to completion with progress milestones
- **Role-Based Access Control**: Granular permissions for admins, officers, and contractors
- **Mobile-First Design**: Offline support, native performance, and accessibility

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CIVIC FIX ECOSYSTEM                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐                   ┌──────────────────┐
│  CITIZEN MOBILE  │                   │  AUTHORITY WEB   │
│  (React Native)  │                   │  (React + Vite)  │
│   - Issue Report │                   │  - Kanban Board  │
│   - Feed View    │                   │  - Team Mgmt     │
│   - Vote/Comment │                   │  - Analytics     │
│   - Status Track │                   │  - Map View      │
└────────┬─────────┘                   └────────┬─────────┘
         │                                       │
         │ REST API + WebSocket Events          │
         │                                       │
         └─────────────────┬─────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   BACKEND (Node.js +    │
              │   Express)              │
              │                         │
              │  - Auth Service         │
              │  - Issue Service        │
              │  - Team Service         │
              │  - AI Assistant Service │
              │  - Comment Service      │
              │  - Update Service       │
              └────────────┬────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
         ┌────▼──────┐         ┌──────▼─────┐
         │  Supabase │         │   Google   │
         │            │         │   Gemini   │
         │ - Auth     │         │   API      │
         │ - Database │         │ (AI Assist)│
         │ - RLS      │         └────────────┘
         │ - Audit    │
         └────────────┘
```

### Data Flow Patterns

#### Issue Lifecycle
```
Citizen Reports Issue (Mobile)
    ↓
Backend validates & stores
    ↓
Officer sees in "Reported" column
    ↓
Officer verifies → moves to "Verified"
    ↓
Officer assigns to Contractor
    ↓
Contractor starts work → "In Progress"
    ↓
Contractor adds updates
    ↓
Officer reviews → "Review"
    ↓
Admin approves → "Completed" or "Blocked"/"Closed"
    ↓
Citizen sees resolved status in mobile app
```

#### Voting & Community Engagement
```
Citizens upvote/downvote issues
    ↓
Vote aggregation surfaces priority
    ↓
Officer dashboard shows vote count
    ↓
Kanban can be sorted by votes for triage
    ↓
High-priority issues get faster resolution
```

#### AI Assistant Flow
```
User queries AI Assistant (mobile/web)
    ↓
Query sent to backend /api/assistant
    ↓
Backend formats context (issue description, category, location)
    ↓
Google Gemini API called with enhanced prompt
    ↓
AI response returned with suggestions/insights
    ↓
UI displays suggestions to user
```

---

## 📁 Project Structure

```
CivicFix/
│
├── backend/                              Node.js + Express API server
│   ├── server.js                         Entry point (port 5001)
│   ├── package.json                      Dependencies
│   ├── .env.example                      Environment template
│   ├── db/
│   │   └── migrations/                   SQL migration files for Supabase
│   │
│   └── src/
│       ├── app.js                        Express app initialization + middleware setup
│       ├── config/
│       │   └── supabaseClient.js         Supabase client (service role for admin ops)
│       │
│       ├── controllers/
│       │   ├── authController.js         Auth logic: signup, login, JWT handling
│       │   ├── issueController.js        Issue CRUD, status updates, filtering
│       │   ├── commentController.js      Comments on issues
│       │   ├── teamController.js         Team members, roles, access approval
│       │   └── assistantController.js    AI assistant query handler
│       │
│       ├── routes/
│       │   ├── authRoutes.js             POST /auth/signup, /auth/login
│       │   ├── issueRoutes.js            GET/POST/PATCH/DELETE /issues
│       │   ├── commentRoutes.js          POST/GET /comments
│       │   ├── teamRoutes.js             Team endpoints (admin + verification)
│       │   └── assistantRoutes.js        POST /assistant (Gemini integration)
│       │
│       ├── services/
│       │   ├── authService.js            Business logic: user creation, JWT generation
│       │   ├── issueService.js           Issue queries, status validation, filters
│       │   ├── commentService.js         Comment operations
│       │   ├── teamService.js            Team member management, role validation
│       │   └── assistantService.js       Gemini API integration, prompt engineering
│       │
│       └── middlewares/
│           ├── authMiddleware.js         JWT verification (requireAuth / optionalAuth)
│           └── errorHandler.js           Global error handling
│
└── frontend/
    ├── CivicFixApp/                      Mobile app – React Native + Expo
    │   ├── App.jsx                       Root component, navigation, state management
    │   ├── app.json                      Expo configuration
    │   ├── config.js                     API endpoint configuration
    │   ├── package.json
    │   │
    │   ├── components/
    │   │   ├── Login.jsx                 Authentication screen
    │   │   ├── Signup.jsx                User registration
    │   │   ├── CreatePost.jsx            Issue reporting form (photo + location)
    │   │   ├── IssueCard.jsx             Issue preview card (feed)
    │   │   ├── Feeds.jsx                 Multi-tab feed (For You, My Posts, Updates)
    │   │   ├── Post.jsx                  Issue detail + comments + timeline
    │   │   ├── CommentForm.jsx           Comment input component
    │   │   ├── CivicAssistant.jsx        AI assistant chat interface
    │   │   ├── Notifications.jsx         Push notifications
    │   │   └── SearchScreen.jsx          Issue search & filter
    │   │
    │   ├── services/
    │   │   ├── updatesService.js         Fetch updates API
    │   │   └── api.js                    HTTP client (Fetch/Axios)
    │   │
    │   └── utils/
    │       ├── formatters.js             Date formatting, text utilities
    │       └── config.js                 Shared configuration
    │
    └── authority-jira/                   Web dashboard – React + Vite + Tailwind v4
        ├── index.html
        ├── vite.config.js                Vite + Tailwind v4 config
        ├── package.json
        │
        ├── src/
        │   ├── main.jsx                  Entry point
        │   ├── index.css                 Global styles + Tailwind imports
        │   ├── App.jsx                   Root component + routing
        │   │
        │   ├── context/
        │   │   └── AuthContext.jsx       Auth state provider (login, logout, user)
        │   │
        │   ├── hooks/
        │   │   ├── useAuth.js            Auth state consumer hook
        │   │   └── useApi.js             API request hook
        │   │
        │   ├── layouts/
        │   │   └── AppLayout.jsx         Main layout with sidebar navigation
        │   │
        │   ├── pages/
        │   │   ├── Landing.jsx           Public marketing page
        │   │   ├── Login.jsx             Officer login (role-based redirect)
        │   │   ├── RequestAccess.jsx     Access approval request UI
        │   │   ├── Dashboard.jsx         Stats, charts, recent activity
        │   │   ├── Issues.jsx            Kanban board + list view with drag-drop
        │   │   ├── IssueDetail.jsx       Single issue: status, assignee, updates
        │   │   ├── Map.jsx               Geospatial visualization
        │   │   ├── Reports.jsx           Analytics: resolution time, volume, trends
        │   │   └── Team.jsx              Member management, approval workflow
        │   │
        │   └── services/
        │       ├── api.js                Fetch wrapper (base URL, auth header)
        │       ├── issuesService.js      Issue API calls
        │       ├── teamService.js        Team API calls
        │       └── updatesService.js     Updates API calls
        │
        └── .env.example                  Environment template
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | Node.js (ES Modules), Express 5 | RESTful API server |
| **Database** | Supabase (PostgreSQL) | Relational data storage |
| **Auth** | Supabase GoTrue + JWT | User authentication & session management |
| **Mobile Frontend** | React Native 0.81, Expo 54 | Cross-platform (iOS, Android, Web) |
| **Web Frontend** | React 19, Vite 8, Tailwind CSS v4 | Authority dashboard |
| **UI Components** | lucide-react, @hello-pangea/dnd | Icons and drag-drop library |
| **AI Integration** | Google Gemini API (@google/genai) | Smart suggestions & analysis |
| **State Management** | React Hooks (useState, useContext) | Local + global state |
| **HTTP Client** | Fetch API, Axios | Network requests |
| **Storage** | @react-native-async-storage | Mobile offline caching |

---

## 🔌 API Endpoints

### Authentication
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/signup` | Register citizen or org member | None |
| POST | `/api/auth/login` | Login → returns JWT + profile | None |
| POST | `/api/auth/logout` | Invalidate session | JWT |

### Issues
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/issues` | List issues (pagination, filters, sorting) | Optional |
| POST | `/api/issues` | Create new issue | JWT |
| GET | `/api/issues/:id` | Get issue detail | Optional |
| PATCH | `/api/issues/:id` | Update status / assignee | JWT (Officer+) |
| DELETE | `/api/issues/:id` | Delete issue | JWT (Creator or Admin) |
| GET | `/api/issues/nearby` | Issues within radius | Optional |
| GET | `/api/issues/map` | Geo points for map view | Optional |
| POST | `/api/issues/:id/updates` | Add progress update | JWT (Assigned) |
| GET | `/api/issues/:id/updates` | List updates | Optional |
| POST | `/api/issues/:id/votes` | Upvote / downvote | JWT |
| DELETE | `/api/issues/:id/votes` | Remove vote | JWT |

### Comments
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/comments` | Add comment to issue | JWT |
| GET | `/api/comments?issueId=:id` | Get comments for issue | Optional |
| DELETE | `/api/comments/:id` | Delete comment | JWT (Creator or Admin) |

### Team (all require JWT except request-access)
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/team/members` | List org members | JWT |
| POST | `/api/team/members` | Add member (creates Supabase user) | JWT (Admin) |
| DELETE | `/api/team/members/:id` | Remove member | JWT (Admin) |
| POST | `/api/team/members/:id/request-access` | Member requests approval | None |
| PATCH | `/api/team/members/:id/verify` | Approve member access | JWT (Admin) |
| GET | `/api/team/members/:id` | Get member details | JWT |

### AI Assistant
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/assistant` | Query AI assistant with context | JWT |
| GET | `/api/assistant/suggestions` | Get smart suggestions for issue | Optional |

### Comments
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/comments` | Add comment | JWT |
| GET | `/api/comments?issueId=:id` | Get issue comments | Optional |
| DELETE | `/api/comments/:id` | Delete comment | JWT |

---

## 📱 Role-Based Features

### Citizen (Mobile App)
- **Report Issues**: Attach photos, location, description
- **Browse Feed**: See all reported civic issues in feed format
- **Vote**: Upvote high-priority, downvote invalid/duplicate issues
- **Comment**: Discuss issues with other citizens and officers
- **Track Status**: Monitor issue resolution in real-time
- **AI Assistant**: Get smart suggestions and context

### Officer (Web Dashboard)
- **Triage Issues**: Review reported issues, verify legitimacy
- **Kanban Workflow**: Move issues through workflow (except final statuses)
- **Assign Issues**: Delegate work to contractors
- **Add Updates**: Post progress notes
- **View Reports**: Analytics on resolution metrics
- **Map View**: Geographic distribution of issues

### Administrator (Web Dashboard)
- **All Officer Capabilities**: Full workflow authority
- **Manage Team**: Add/remove/edit officers and contractors
- **Access Approval**: Verify new team members
- **Final Status Control**: Approve completion, block, or close issues
- **Team Analytics**: Monitor team performance
- **System Settings**: Configure organization-wide rules

---

## 🔐 Access Control & Security

### Authentication Flow
1. User signs up/logs in via Supabase GoTrue
2. Backend returns JWT (contains user ID, role, org)
3. JWT stored in localStorage (web) / AsyncStorage (mobile)
4. All API requests include `Authorization: Bearer <JWT>`
5. Backend verifies JWT signature and checks permissions

### Access Approval Workflow
```
1. Admin adds new officer/contractor → `access_requested = false`, `verified = false`
2. New member tries login → blocked with "Access not yet approved" message
3. Member requests access → `access_requested = true`
4. Admin sees badge in Team page → reviews member details
5. Admin clicks "Approve Access" → `verified = true`
6. Member can now login and access dashboard
```

### Role-Based Permissions
| Action | Citizen | Officer | Contractor | Admin |
|---|---|---|---|---|
| Report issues | ✓ | ✓ | ✗ | ✓ |
| Vote issues | ✓ | ✓ | ✓ | ✓ |
| Comment | ✓ | ✓ | ✓ | ✓ |
| View all issues | ✓ | ✓ | ✗ | ✓ |
| Triage (Verify) | ✗ | ✓ | ✗ | ✓ |
| Assign issues | ✗ | ✓ | ✗ | ✓ |
| Move to In Progress/Review | ✗ | ✓ | ✓ | ✓ |
| Move to Completed/Blocked/Closed | ✗ | ✗ | ✗ | ✓ |
| Manage team members | ✗ | ✗ | ✗ | ✓ |
| Approve access | ✗ | ✗ | ✗ | ✓ |

---

## 🔄 Issue Status Workflow

```
                    ┌─────────────────────────────────────┐
                    │        ISSUE LIFECYCLE              │
                    └─────────────────────────────────────┘

                          ┌──────────────────┐
                          │   REPORTED       │ (Citizen submitted)
                          │ (Initial state)  │
                          └────────┬─────────┘
                                   │ Officer reviews
                                   ↓
                          ┌──────────────────┐
                          │   VERIFIED       │ (Legitimacy confirmed)
                          └────────┬─────────┘
                                   │ Officer assigns
                                   ↓
                          ┌──────────────────┐
                          │  IN PROGRESS     │ (Work started)
                          └────────┬─────────┘
                                   │ Updates added
                                   ↓
                          ┌──────────────────┐
                          │    REVIEW        │ (QA check)
                          └────────┬─────────┘
                                   │ Admin approves
                                   ↓
                          ┌──────────────────┐
                          │   COMPLETED      │ (Resolved) ⟹ ADMIN ONLY
                          └──────────────────┘
                                   
                            OR (branching from any state):
                          
                          ┌──────────────────┐
                          │    BLOCKED       │ (Can't proceed) ⟹ ADMIN ONLY
                          └──────────────────┘

                          ┌──────────────────┐
                          │    CLOSED        │ (Duplicate/Invalid) ⟹ ADMIN ONLY
                          └──────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm 8+
- Supabase account (free tier OK)
- Google Cloud account (for Gemini API)

### 1. Clone Repository

```bash
git clone https://github.com/Civic-Fix/CivicFix.git
cd CivicFix
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env`:
```env
# Supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
DEFAULT_ORGANIZATION_ID=<org-uuid>

# Google Gemini API
GOOGLE_GENAI_API_KEY=<your-api-key>

# Frontend
FRONTEND_URL=http://localhost:5174

# Server
PORT=5001
NODE_ENV=development
```

Run SQL migrations in Supabase SQL editor:

```sql
-- Status change logging (RPC + trigger fix)
CREATE OR REPLACE FUNCTION update_issue_status_by_authority(
  p_issue_id uuid, p_status text, p_changed_by uuid, p_verification_status text DEFAULT NULL
) RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM set_config('app.current_user_id', p_changed_by::text, true);
  UPDATE public.issues
    SET status = p_status::issue_status,
        verification_status = CASE WHEN p_verification_status IS NOT NULL
          THEN p_verification_status::verification_status ELSE verification_status END
  WHERE id = p_issue_id;
  RETURN json_build_object('success', true);
END;$$;

-- Access-request column for team approval flow
ALTER TABLE organization_members ADD COLUMN IF NOT EXISTS access_requested boolean DEFAULT false;
```

Start backend:
```bash
npm start
# Running on http://localhost:5001
```

### 3. Mobile App Setup

```bash
cd frontend/CivicFixApp
npm install
```

Create `.env` (optional):
```env
EXPO_PUBLIC_API_BASE_URL=http://<LAN_IP>:5001/api
```

Start Expo:
```bash
npx expo start
```

Scan QR code or press `i` (iOS) / `a` (Android) / `w` (Web)

### 4. Web Dashboard Setup

```bash
cd frontend/authority-jira
npm install
npm run dev
# Running on http://localhost:5174
```

Available commands:
```bash
npm run dev         # Development server
npm run build       # Production build
npm run preview     # Preview production build
npm run lint        # Check code style
```

---

## 📊 Key Features

### Citizen Mobile App
- ✅ **Issue Reporting**: Location-based civic complaints with photos
- ✅ **Feed Discovery**: Browse all civic issues in your area
- ✅ **Community Voting**: Upvote/downvote to surface priorities
- ✅ **Real-Time Tracking**: Monitor issue status updates
- ✅ **Comments & Discussion**: Engage with officers and citizens
- ✅ **AI Assistant**: Smart suggestions using Google Gemini
- ✅ **Notifications**: Push alerts on status changes
- ✅ **Offline Support**: AsyncStorage caching

### Authority Web Dashboard
- ✅ **Kanban Board**: 7-column drag-drop workflow
- ✅ **Issue Triage**: Verify and categorize reported issues
- ✅ **Team Management**: Invite officers and contractors
- ✅ **Access Approval**: Verify team members before login
- ✅ **Assignment Workflow**: Auto-save assignee changes
- ✅ **Progress Tracking**: Update and timeline management
- ✅ **Geospatial Map**: Visualize issue distribution
- ✅ **Analytics Dashboard**: Resolution metrics and trends
- ✅ **Admin Controls**: Final status approval (Completed/Blocked/Closed)

---

## 🧠 AI Assistant Integration

The CivicFix AI Assistant uses **Google Gemini API** to provide:

- **Contextual Categorization**: Automatically categorize reported issues
- **Priority Suggestions**: Estimate urgency based on issue description
- **Duplicate Detection**: Identify similar issues
- **Solution Hints**: Provide troubleshooting suggestions for contractors
- **Trend Analysis**: Summarize patterns across multiple issues

### Example Query
```
User: "There's a big pothole on Main Street"
AI Response: "This looks like road damage. Estimated severity: Medium.
Similar issues in your area: 3 (all resolved within 5-7 days).
Suggested contractor expertise: Pothole repair & asphalt."
```

---

## 📈 Database Schema Overview

### Key Tables
- **auth.users**: Supabase managed users (email, password hash)
- **public.users**: CivicFix user profiles (name, phone, preferences)
- **public.organizations**: Municipal organizations
- **public.organization_members**: Team members with roles (admin, officer, contractor)
- **public.issues**: Civic complaints with status, assignee, location
- **public.issue_updates**: Progress notes and status changes (audit trail)
- **public.comments**: Issue comments and discussion
- **public.votes**: Community upvote/downvote tracking

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License – See LICENSE file for details

---

## 👥 Team

- **Debayan** – Full-stack development, architecture
- **Arindam** – Frontend, UI/UX design
- **Nikunj** – Backend, API design, database
- **Kaushik** – Mobile development, DevOps

---

## 📞 Support & Contact

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: [team email]
- Docs: [link to detailed docs]

---

**Last Updated**: June 2026  
**Version**: 1.0.0
