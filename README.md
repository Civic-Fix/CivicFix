# CivicFix – Smart Civic Complaint Management System

CivicFix is a centralized platform designed to streamline the process of reporting, managing, and resolving civic issues. It connects **citizens, municipal officers, and field contractors** into a single transparent ecosystem.

---

## Project Structure

```
CivicFix/
├── backend/                              Node.js + Express API server
│   ├── server.js                         Entry point (port 5000)
│   ├── package.json                      Dependencies & scripts
│   ├── check-db.js                       Database health check utility
│   ├── test-api.js                       API testing script
│   ├── db/
│   │   └── migrations/                   SQL migrations
│   │       ├── 001_issue_geospatial_setup.sql
│   │       ├── 002_votes_unique_constraint.sql
│   │       ├── 003_fix_storage_rls.sql
│   │       ├── 004_fix_users_trigger_add_email.sql
│   │       ├── 005_votes_add_vote_type.sql
│   │       ├── 006_comments_table.sql
│   │       └── 007_split_citizen_and_org_member_profiles.sql
│   ├── scripts/                          Setup & configuration scripts
│   │   ├── setup-organization.js
│   │   ├── setup-storage.js
│   │   └── setup-storage-rls.js
│   └── src/
│       ├── app.js                        Express app setup & middleware
│       ├── config/
│       │   └── supabaseClient.js         Supabase initialization
│       ├── controllers/
│       │   ├── authController.js         Authentication handlers
│       │   ├── issueController.js        Issue management handlers
│       │   ├── commentController.js      Comment management handlers
│       │   └── assistantController.js    AI Assistant handlers
│       ├── routes/
│       │   ├── authRoutes.js             Authentication endpoints
│       │   ├── issueRoutes.js            Issue management endpoints
│       │   ├── commentRoutes.js          Comment endpoints
│       │   └── assistantRoutes.js        Assistant AI endpoints
│       ├── services/
│       │   ├── authService.js            Supabase auth logic
│       │   ├── issueService.js           Issue business logic
│       │   ├── commentService.js         Comment business logic
│       │   └── assistantService.js       AI Assistant logic
│       └── middlewares/
│           └── authMiddleware.js         JWT verification
│
└── frontend/
    ├── CivicFixApp/                      Mobile app – React Native + Expo
    │   ├── App.jsx                       Root component
    │   ├── index.js                      Entry point
    │   ├── app.json                      Expo configuration
    │   ├── eas.json                      EAS build configuration
    │   ├── package.json                  Dependencies & scripts
    │   ├── assets/                       Static assets
    │   ├── config/                       Configuration files
    │   ├── components/
    │   │   ├── Login.jsx                 Login screen
    │   │   ├── Signup.jsx                Signup screen
    │   │   ├── CreatePost.jsx            Create issue component
    │   │   ├── IssueCard.jsx             Issue card component
    │   │   ├── Feeds.jsx                 Issues feed
    │   │   ├── FeedsStyles.js            Feed styling
    │   │   ├── Post.jsx                  Post/Issue view
    │   │   ├── CommentForm.jsx           Comment submission
    │   │   ├── CivicAssistant.jsx        AI Assistant component
    │   │   └── Notifications.jsx         Notifications
    │   └── utils/
    │       └── api.js                    API client
    │
    └── authority-jira/                   Web dashboard – React + Vite
        ├── index.html                    HTML entry point
        ├── package.json                  Dependencies & scripts
        ├── vite.config.js                Vite configuration
        ├── eslint.config.js              ESLint configuration
        ├── README.md                     Dashboard documentation
        └── src/
            ├── main.jsx                  React entry point
            ├── App.jsx                   Root component
            ├── App.css                   Global styles
            ├── index.css                 Base styles
            ├── components/
            │   ├── Navbar.jsx
            │   ├── Footer.jsx
            │   ├── Hero.jsx
            │   ├── Features.jsx
            │   ├── HowItWorks.jsx
            │   ├── Stats.jsx
            │   ├── Testimonials.jsx
            │   ├── Icon.jsx
            │   ├── landingData.js
            │   ├── RequestAccessModal.jsx
            │   └── ui/
            │       ├── Button.jsx
            │       ├── Card.jsx
            │       ├── Loader.jsx
            │       ├── StatusBadge.jsx
            │       └── Table.jsx
            ├── context/
            │   ├── AuthContext.js
            │   └── AuthContext.jsx
            ├── hooks/
            │   └── useAuth.js
            ├── layouts/
            │   └── AppLayout.jsx
            ├── pages/
            │   ├── Dashboard.jsx
            │   ├── Issues.jsx
            │   ├── IssueDetail.jsx
            │   ├── Map.jsx
            │   ├── Reports.jsx
            │   ├── Team.jsx
            │   ├── Login.jsx
            │   ├── Landing.jsx
            │   └── RequestAccess.jsx
            ├── services/
            │   ├── api.js
            │   ├── issuesService.js
            │   └── updatesService.js
            └── utils/
                └── formatDate.js
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js (ES Modules), Express 5 |
| Auth & Database | Supabase (PostgreSQL + JWT Auth) |
| Mobile App | React Native 0.81, Expo 54 |
| Web Dashboard | React 19, Vite 8 |
| API Client (mobile) | Fetch API + AsyncStorage |
| API Client (web) | Axios |
| UI (web) | Bootstrap 5 (CDN), lucide-react |
| Drag & Drop (web) | @hello-pangea/dnd |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register (name, email, phone, password) |
| POST | `/api/auth/login` | Login with email/password → returns JWT |
| POST | `/api/issues` | Create an issue with mandatory image proof and coordinates |
| GET | `/api/issues` | Fetch all issues with pagination |
| GET | `/api/issues/:id` | Get specific issue details |
| GET | `/api/issues/nearby?lat=<lat>&lng=<lng>&radius=<meters>&limit=<count>` | Fetch nearby issues sorted by distance |
| GET | `/api/issues/map?limit=<count>` | Fetch geo points for map, clustering, and heatmap views |
| POST | `/api/comments` | Add comment to an issue |
| GET | `/api/comments/:issueId` | Fetch comments for an issue |
| POST | `/api/assistant` | Query the AI Assistant |
| GET | `/api/assistant/suggestions` | Get AI suggestions for issues |

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Civic-Fix/CivicFix.git
cd CivicFix
```

---

### 2. Backend

```bash
cd backend
npm install
```

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

`.env` requires:

```
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
DEFAULT_ORGANIZATION_ID=<existing-organization-uuid>
PORT=5000
```

Run the PostGIS migration in your Supabase SQL editor before creating location-aware issues:

```sql
-- file: backend/db/migrations/001_issue_geospatial_setup.sql
```

Start the server:

```bash
npm start
```

Server runs at `http://localhost:5000`.

---

### 3. Mobile App (CivicFixApp)

> Requires [Expo Go](https://expo.dev/go) installed on your phone/tablet.

```bash
cd frontend/CivicFixApp
npm install
```

Copy the example env file and set your machine's local IP:

```bash
cp .env.example .env
```

`.env` requires:

```
EXPO_PUBLIC_API_BASE_URL=http://<YOUR_PC_LAN_IP>:5000/api
```

> Find your LAN IP with `ipconfig` (Windows) or `ifconfig` (Mac/Linux). Your phone and PC must be on the same Wi-Fi network.

Start the Expo dev server:

```bash
npx expo start
```

| Command | Target |
|---|---|
| `npx expo start` | Show QR code (scan with Expo Go) |
| `npx expo start --android` | Open on Android emulator |
| `npx expo start --ios` | Open on iOS simulator |
| `npx expo start --web` | Open in browser |

---

### 4. Web Dashboard (authority-jira)

```bash
cd frontend/authority-jira
npm install
npm run dev
```

Dashboard runs at `http://localhost:5173`.

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Features

- **Issue Reporting**: Citizens can report civic issues with location, images, and detailed descriptions
- **Geospatial Search**: Find nearby issues using coordinates and radius filtering
- **Commenting System**: Community discussions and updates on issues
- **AI Assistant**: Smart suggestions and automated responses via integrated AI
- **Issue Voting**: Upvote/downvote issues to highlight priority
- **Role-Based Access**: Separate profiles for citizens and organization members
- **Real-Time Updates**: Track issue status and receive notifications
- **Storage Management**: RLS-secured image and document storage via Supabase

---

## Workflow

1. **Citizen Reporting**: Report complaints with location, images, and detailed descriptions
2. **Community Engagement**: Other citizens can comment, vote, and discuss the issue
3. **AI Assistance**: AI Assistant provides suggestions and context for better resolution
4. **Officer Review**: Municipal officers prioritize based on urgency, impact, and votes
5. **Task Assignment**: Officers assign to field contractors with full issue details
6. **Contractor Updates**: Field workers upload proof of completion and track progress
7. **Citizen Notification**: Real-time updates and resolution notifications to reporters

---

## User Roles

### Citizen
- Report complaints with location, images, and descriptions
- Track complaint status in real-time
- Receive updates and notifications

### Municipal Officer
- Prioritize complaints by urgency and impact
- Assign tasks to field contractors
- Monitor progress and SLA compliance

### Field Contractor
- View assigned tasks with full details
- Upload proof of completion (images, notes)
- Update task status efficiently

---

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

## Team

- Debayan
- Arindam
- Nikunj
- Kaushik
