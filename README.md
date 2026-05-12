# CivicFix – Smart Civic Complaint Management System

CivicFix is a centralized platform that streamlines reporting, managing, and resolving civic issues. It connects **citizens, municipal officers, and field contractors** into a single transparent ecosystem.

---

## Project Structure

```
CivicFix/
├── backend/                              Node.js + Express API server
│   ├── server.js                         Entry point (port 5000)
│   ├── package.json
│   ├── db/
│   │   └── migrations/                   SQL migration files
│   └── src/
│       ├── app.js                        Express app + middleware
│       ├── config/
│       │   └── supabaseClient.js         Supabase (service role) client
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── issueController.js
│       │   ├── commentController.js
│       │   ├── teamController.js
│       │   └── assistantController.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── issueRoutes.js
│       │   ├── commentRoutes.js
│       │   ├── teamRoutes.js
│       │   └── assistantRoutes.js
│       ├── services/
│       │   ├── authService.js
│       │   ├── issueService.js
│       │   ├── commentService.js
│       │   ├── teamService.js
│       │   └── assistantService.js
│       └── middlewares/
│           └── authMiddleware.js         JWT verification (requireAuth / optionalAuth)
│
└── frontend/
    ├── CivicFixApp/                      Mobile app – React Native + Expo
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── CreatePost.jsx
    │   │   ├── IssueCard.jsx
    │   │   ├── Feeds.jsx
    │   │   ├── Post.jsx
    │   │   ├── CommentForm.jsx
    │   │   ├── CivicAssistant.jsx
    │   │   └── Notifications.jsx
    │   └── utils/
    │       └── api.js
    │
    └── authority-jira/                   Web dashboard – React + Vite + Tailwind v4
        └── src/
            ├── context/
            │   └── AuthContext.jsx       Auth state + signIn / signOut
            ├── hooks/
            │   └── useAuth.js
            ├── layouts/
            │   └── AppLayout.jsx
            ├── pages/
            │   ├── Landing.jsx           Public marketing page
            │   ├── Login.jsx             Officer login + access-request flow
            │   ├── RequestAccess.jsx
            │   ├── Dashboard.jsx         Stats overview
            │   ├── Issues.jsx            Kanban board + list view
            │   ├── IssueDetail.jsx       Issue workflow (status + assignee + updates)
            │   ├── Map.jsx               Geo map of issues
            │   ├── Reports.jsx           Charts & analytics
            │   └── Team.jsx              Team management (admin)
            └── services/
                ├── api.js                Fetch-based API client
                ├── issuesService.js
                ├── teamService.js
                └── updatesService.js
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js (ES Modules), Express 5 |
| Auth & Database | Supabase (PostgreSQL + GoTrue JWT) |
| Mobile App | React Native 0.81, Expo 54 |
| Web Dashboard | React 19, Vite 8, Tailwind CSS v4 |
| Drag & Drop | @hello-pangea/dnd |
| Icons | lucide-react |
| AI Assistant | Google Gemini (@google/genai) |

---

## API Endpoints

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register citizen or org member |
| POST | `/api/auth/login` | Login → returns JWT + profile |

### Issues

| Method | Path | Description |
|---|---|---|
| GET | `/api/issues` | List issues (pagination, filters) |
| POST | `/api/issues` | Create issue |
| GET | `/api/issues/:id` | Get issue detail |
| PATCH | `/api/issues/:id` | Update status / assignee |
| DELETE | `/api/issues/:id` | Delete issue (creator only) |
| GET | `/api/issues/nearby` | Issues within radius of coordinates |
| GET | `/api/issues/map` | Geo points for map view |
| POST | `/api/issues/:id/updates` | Add progress update |
| GET | `/api/issues/:id/updates` | List updates |
| POST | `/api/issues/:id/votes` | Upvote / downvote |
| DELETE | `/api/issues/:id/votes` | Remove vote |

### Team (all require JWT except request-access)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/team/members` | Required | List org members |
| POST | `/api/team/members` | Admin only | Add member (creates Supabase auth user) |
| DELETE | `/api/team/members/:id` | Admin only | Remove member |
| POST | `/api/team/members/:id/request-access` | Public | Member requests access approval |
| PATCH | `/api/team/members/:id/verify` | Admin only | Approve member access |

### Assistant

| Method | Path | Description |
|---|---|---|
| POST | `/api/assistant` | Query AI assistant |
| GET | `/api/assistant/suggestions` | Get AI suggestions |

---

## Setup

### 1. Clone

```bash
git clone https://github.com/Civic-Fix/CivicFix.git
cd CivicFix
```

### 2. Backend

```bash
cd backend
npm install
```

Create `.env`:

```env
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
DEFAULT_ORGANIZATION_ID=<org-uuid>
FRONTEND_URL=http://localhost:5174
PORT=5001
```

Run required SQL migrations in Supabase SQL editor:

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

Start server:

```bash
npm start
# http://localhost:5001
```

### 3. Mobile App

```bash
cd frontend/CivicFixApp
npm install
```

`.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://<LAN_IP>:5001/api
```

On Mac, Expo web and the iOS simulator work without a `.env` because the app falls back to `http://localhost:5001/api`. Use your Mac LAN IP instead of `localhost` only when testing from a physical phone.

```bash
npx expo start
```

### 4. Web Dashboard

```bash
cd frontend/authority-jira
npm install
npm run dev
# http://localhost:5174
```

| Command | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm run lint` | ESLint |

---

## Key Features

### Citizen Mobile App
- Report civic issues with location, photos, and description
- Upvote/downvote issues to surface priority problems
- AI assistant for smart suggestions and context
- Track issue status in real-time

### Authority Web Dashboard
- **Kanban board** – drag issues across status columns (Reported → Verified → In Progress → Review → Completed)
- **Admin-only statuses** – only admins can move issues to Completed / Blocked / Closed
- **Assignee workflow** – assign any issue to any team member via dropdown; auto-saves on change
- **Team management** – admin adds officers/contractors with name, email, password, role, department
- **Access control** – new members start unverified; they request access from the login page; admin approves from Team page
- **Issue detail** – status updates, assignee changes, and progress notes in one view
- **Map view** – geo map of all issues with markers
- **Reports** – charts and analytics on issue volume and resolution

### Role System

| Role | Can Do |
|---|---|
| Admin | Full access: manage team, approve members, move issues to any status, assign issues |
| Officer | Triage issues, update status (except Completed/Blocked/Closed), assign issues |
| Contractor | View and update assigned issues |

---

## Access Control Flow

1. Admin adds a new officer/contractor via the Team page
2. New member tries to log in → blocked with "Access not yet approved" screen
3. Member clicks **Request Access from Admin**
4. Admin sees "Requested Access" badge in Team page → clicks **Approve Access**
5. Member can now log in normally

---

## Status Workflow

```
Reported → Verified → In Progress → Review → Completed
                                           ↓
                                        Blocked / Closed  (admin only)
```

---

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT License

## Team

- Debayan
- Arindam
- Nikunj
- Kaushik
