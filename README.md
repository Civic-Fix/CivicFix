# CivicFix – Smart Civic Complaint Management System

## 🎯 Vision & Mission

### Vision
To revolutionize civic governance by creating a transparent, data-driven platform that empowers citizens to voice concerns and enables municipal authorities to respond efficiently and equitably.

### Mission
CivicFix bridges the gap between citizens and government by:
- **Empowering Citizens**: Providing an accessible, mobile-first platform to report and track civic issues with real-time transparency
- **Enabling Authorities**: Equipping municipal officers with tools to triage, assign, and resolve issues efficiently using intelligent workflows
- **Building Trust**: Creating an auditable, transparent system where every issue has a documented lifecycle from report to resolution
- **Leveraging Technology**: Integrating AI-powered assistance and geospatial visualization to prioritize and understand civic challenges at scale

---

## 📋 Quick Links

- **Live Demo**: [civic-fix-red.vercel.app](https://civic-fix-red.vercel.app)
- **Architecture Guide**: [ARCHITECTURE.md](ARCHITECTURE.md) ← **Start here for technical details**
- **Migration Guide**: [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- **GitHub Repo**: [Civic-Fix/CivicFix](https://github.com/Civic-Fix/CivicFix)

---

## 📰 Latest Updates (May 22, 2026)

### Recent Commits
| Date | Commit | Author |
|------|--------|--------|
| May 22 | 🎨 Increase height of issue card component | Nikunj Kumar Agarwal |
| May 22 | 📎 Update Attachment | Nikunj Kumar Agarwal |
| May 21 | 🤖 Added AI summary and categorization features | KH-Coder865 |
| May 21 | 🗺️ Added issue map and feed improvements | Nikunj Kumar Agarwal |
| May 19 | 📍 Update Trail Functionality Sync | Arindam-GitH |
| May 17 | 📝 Added Update Trail Functionality | KH-Coder865 |
| May 12 | 🧹 Dashboard Cleanup | Arindam-GitH |
| May 11 | 🏢 Authority Dashboard Launch | KH-Coder865 |

**[View all commits →](https://github.com/Civic-Fix/CivicFix/commits/main)**

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│              FRONTEND LAYER (User Interfaces)            │
├────────────────────────┬─────────────────────────────────┤
│  Mobile App (Expo)     │  Web Dashboard (React + Vite)   │
│  • Issue Reporting     │  • Kanban Board                 │
│  • Feed View           │  • Team Management              │
│  • Vote/Comment        │  • Analytics & Maps             │
│  • Status Track        │  • Admin Controls               │
└────────────────────────┴──────────────┬────────────────────┘
              ↓ REST API + WebSocket ↓
┌─────────────────────────────────────────────────────────┐
│           BACKEND API (Node.js + Express)              │
│  • Auth Service        • Issue Service                  │
│  • Team Service        • AI Assistant Service           │
│  • Comment Service     • Update Service                 │
└──────────────────────┬─────────────────────────────────┘
        ↓ SQL Queries ↓          ↓ AI API ↓
   ┌─────────────────────────┐  ┌──────────────┐
   │  Supabase (PostgreSQL)  │  │ Google Gemini│
   │  • Auth (JWT)           │  │ • Categorize │
   │  • Issues DB            │  │ • Summarize  │
   │  • Audit Trail          │  │ • Suggest    │
   └─────────────────────────┘  └──────────────┘
```

📖 **[See detailed architecture diagram →](ARCHITECTURE.md#architecture-diagram)**

---

## 📁 Project Structure

```
CivicFix/
├── backend/                    Node.js + Express API
│   ├── src/
│   │   ├── controllers/         Request handlers
│   │   ├── services/            Business logic
│   │   ├── routes/              API endpoints
│   │   ├── middlewares/         JWT verification
│   │   └── config/              Supabase config
│   └── package.json
│
└── frontend/
    ├── CivicFixApp/            React Native mobile app
    │   ├── components/          UI screens
    │   ├── services/            API integration
    │   └── config.js            Configuration
    │
    └── authority-jira/         React web dashboard
        ├── src/
        │   ├── pages/           Dashboard pages
        │   ├── context/         Auth context
        │   └── services/        API client
        └── vite.config.js
```

**[See full structure →](ARCHITECTURE.md#project-structure)**

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend** | Node.js + Express | 5.x |
| **Frontend (Web)** | React + Vite + Tailwind v4 | 19.x + 8.x |
| **Frontend (Mobile)** | React Native + Expo | 0.81 + 54.x |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Auth** | Supabase GoTrue (JWT) | Latest |
| **AI** | Google Gemini API | 1.52.0 |
| **UI Libs** | lucide-react, @hello-pangea/dnd | Latest |

**Language Composition:** 97.8% JavaScript, 1.5% PLpgSQL, 0.7% Other

---

## 🌟 Key Features

### 🔴 Citizen Mobile App
✅ Report civic issues with photos & GPS location  
✅ Browse issue feed (For You, My Posts, Updates)  
✅ Vote to prioritize issues  
✅ Comment and discuss with officers  
✅ Real-time status tracking  
✅ AI Assistant for smart suggestions  
✅ Offline caching with AsyncStorage  
✅ Push notifications for updates  

### 🏛️ Authority Web Dashboard
✅ **Kanban Board** – Drag-drop workflow (7 status columns)  
✅ **Issue Triage** – Verify and categorize reported issues  
✅ **Team Management** – Add/remove officers & contractors  
✅ **Access Approval** – Multi-tier verification system  
✅ **Smart Assignment** – Auto-save on assignee change  
✅ **Geo Map** – Geographic issue distribution  
✅ **Analytics** – Resolution metrics and trends  
✅ **Admin Controls** – Final status approvals  

### 🤖 AI-Powered Features
✅ **Auto Categorization** – Issue type classification  
✅ **Smart Summaries** – Generate concise issue descriptions  
✅ **Solution Suggestions** – Recommend resolution actions  
✅ **Assistant Chat** – Contextual civic guidance  
✅ **Rate Limited** – 10 requests/hour per user  

---

## 🔌 API Endpoints

### Core Resources

**Authentication**
```
POST   /api/auth/signup       Register user
POST   /api/auth/login        Login → JWT token
```

**Issues**
```
GET    /api/issues            List issues (filters, pagination)
POST   /api/issues            Create issue
PATCH  /api/issues/:id        Update status/assignee
GET    /api/issues/:id        Get issue detail
GET    /api/issues/nearby     Geo-search
POST   /api/issues/:id/votes  Vote (up/down)
```

**Team**
```
GET    /api/team/members          List members
POST   /api/team/members          Add member (admin)
PATCH  /api/team/members/:id/verify  Approve access (admin)
```

**AI**
```
POST   /api/ai/categorize     Categorize issue
POST   /api/ai/summarize      Generate summary
POST   /api/assistant         Query AI
```

📚 **[Full API Documentation →](ARCHITECTURE.md#api-design)**

---

## 🔐 Access Control

### Role Permissions

| Capability | Citizen | Officer | Contractor | Admin |
|-----------|---------|---------|-----------|-------|
| Report Issues | ✓ | ✓ | ✗ | ✓ |
| Vote Issues | ✓ | ✓ | ✓ | ✓ |
| Triage/Verify | ✗ | ✓ | ✗ | ✓ |
| Assign Issues | ✗ | ✓ | ✗ | ✓ |
| Complete Issues | ✗ | ✗ | ✗ | ✓ |
| Manage Team | ✗ | ✗ | ✗ | ✓ |
| Approve Access | ✗ | ✗ | ✗ | ✓ |

### Access Approval Flow

1. **Admin adds member** via Team page
2. **Member attempts login** → blocked with "Access not yet approved"
3. **Member requests access** → flag appears in Team page
4. **Admin approves** → member gains full access

---

## 🔄 Issue Status Workflow

```
Reported → Verified → In Progress → Review → Completed
                                             ↓ (admin only)
                                    Blocked / Closed
```

| Status | Description | Who Can Move |
|--------|-------------|-------------|
| Reported | Citizen submitted issue | Officer+ |
| Verified | Officer confirmed validity | Officer+ |
| In Progress | Contractor actively working | Officer+ |
| Review | Work done, awaiting QA | Officer+ |
| Completed | Issue resolved | Admin only |
| Blocked | Cannot proceed (obstruction) | Admin only |
| Closed | Duplicate or invalid | Admin only |

---

## 🚀 Quick Start

### Prerequisites
```
Node.js 18+
npm 8+
Supabase account
Google Cloud API key (for Gemini)
```

### Setup (3 Minutes)

**1. Clone & Install**
```bash
git clone https://github.com/Civic-Fix/CivicFix.git
cd CivicFix
```

**2. Backend**
```bash
cd backend
npm install
# Create .env with Supabase credentials + Google API key
npm start
# Running on http://localhost:5001
```

**3. Frontend (choose one)**

Mobile:
```bash
cd frontend/CivicFixApp
npm install
npx expo start
```

Web Dashboard:
```bash
cd frontend/authority-jira
npm install
npm run dev
# Running on http://localhost:5174
```

📖 **[Detailed setup guide →](ARCHITECTURE.md#deployment)**

---

## 🤝 Contributing

```bash
1. Fork the repository
2. Create a feature branch: git checkout -b feature/your-feature
3. Commit: git commit -m "Add your feature"
4. Push: git push origin feature/your-feature
5. Open a Pull Request
```

**Code Standards:**
- Use ES modules in backend
- Follow existing component patterns
- Add comments for complex logic
- Test endpoints before submitting

---

## 📊 Project Stats

- **Created**: March 17, 2026
- **Last Updated**: June 1, 2026
- **Status**: Active Development
- **Language**: 97.8% JavaScript, 1.5% PLpgSQL, 0.7% Other
- **Team**: 4 developers

---

## 📄 License

MIT License – See LICENSE file

---

## 👥 Team

| Member | Role | Focus |
|--------|------|-------|
| **Debayan** | Backend Lead | Architecture & Database |
| **Arindam** | Frontend Lead | Web Dashboard & UI/UX |
| **Nikunj** | Full Stack | Mobile App & Geolocation |
| **Kaushik** | DevOps Lead | AI Integration & Deployment |

---

## 📞 Support

| Resource | Link |
|----------|------|
| **Live Demo** | [civic-fix-red.vercel.app](https://civic-fix-red.vercel.app) |
| **Architecture** | [ARCHITECTURE.md](ARCHITECTURE.md) |
| **Issues** | [GitHub Issues](https://github.com/Civic-Fix/CivicFix/issues) |
| **Commits** | [All commits](https://github.com/Civic-Fix/CivicFix/commits/main) |

---

**Questions? Open an issue or check the [Architecture Guide](ARCHITECTURE.md)!**

## Affinity Map Link
https://drive.google.com/file/d/1yW3NGpZ46KwXfg9tbDL_SP9VMNVS0JDs/view?usp=drivesdk
