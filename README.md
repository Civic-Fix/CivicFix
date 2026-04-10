# CivicFix – Smart Civic Complaint Management System

CivicFix is a centralized platform designed to streamline the process of reporting, managing, and resolving civic issues. It connects **citizens, municipal officers, and field contractors** into a single transparent ecosystem.

---

## Project Structure

```
CivicFix/
├── backend/                        Node.js + Express API server
│   ├── server.js                   Entry point (port 5000)
│   ├── .env.example                Environment variable template
│   └── src/
│       ├── app.js                  Express app setup & middleware
│       ├── config/
│       │   └── supabaseClient.js   Supabase initialization
│       ├── controllers/
│       │   ├── authController.js   Login / Signup handlers
│       │   └── issueController.js  Issue management (in progress)
│       ├── routes/
│       │   ├── authRoutes.js       Auth endpoints
│       │   └── issueRoutes.js      Issue endpoints (in progress)
│       ├── services/
│       │   └── authService.js      Supabase auth logic
│       └── middlewares/
│           └── authMiddleware.js   JWT verification
│
└── frontend/
    ├── CivicFixApp/                Mobile app – React Native + Expo
    │   ├── App.jsx                 Root component
    │   ├── .env.example            Environment variable template
    │   ├── components/
    │   │   ├── Login.jsx
    │   │   └── Signup.jsx
    │   └── utils/
    │       └── api.js              Axios API client
    │
    └── authority-jira/             Web dashboard – React + Vite
        ├── src/
        │   ├── main.jsx
        │   └── App.jsx
        └── vite.config.js
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
PORT=5000
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

## Workflow

1. Citizen submits a complaint (location, images, description)
2. System assigns priority based on urgency and complexity
3. Officer reviews and assigns to a field contractor
4. Contractor completes the task and uploads proof
5. Citizen receives a resolution update

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