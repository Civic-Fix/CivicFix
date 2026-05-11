# CivicFix Authority Dashboard

The web dashboard for municipal officers and administrators to manage civic issues reported by citizens.

Built with **React 19 + Vite + Tailwind CSS v4**.

---

## Getting Started

```bash
npm install
npm run dev
# http://localhost:5174
```

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

The dashboard expects the backend running at `http://localhost:5000`. Set `VITE_API_BASE_URL` in `.env` to override.

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Public marketing page |
| `/login` | Login | Officer login with access-request flow |
| `/dashboard` | Dashboard | Stats overview |
| `/issues` | Issues | Kanban board + list view |
| `/issues/:id` | IssueDetail | Status, assignee, updates |
| `/map` | Map | Geo map of all issues |
| `/reports` | Reports | Charts & analytics |
| `/team` | Team | Team management (admin only) |

---

## Features

### Issues Board
- Drag-and-drop Kanban across 7 status columns
- List view with sortable table
- Admin-only statuses: **Completed**, **Blocked**, **Closed** — non-admins see these columns as locked
- Real-time status saves via backend RPC (preserves audit log)

### Issue Detail
- Update issue status with a single click
- **Assignee dropdown** — assign to any team member; auto-saves on change
- Add progress notes/updates
- View submitted photos

### Team Management (Admin)
- Add officers and contractors (creates their Supabase auth account)
- One admin per organization enforced
- **Access approval flow**: new members are unverified by default and must request access; admin approves from this page
- Remove members (deletes their auth account)

### Access Control Flow
1. Admin creates a member via Team page
2. Member logs in → blocked with "Access not yet approved"
3. Member clicks **Request Access from Admin**
4. Admin sees **Requested Access** badge → clicks **Approve Access**
5. Member can now log in

---

## Role Permissions

| Action | Admin | Officer | Contractor |
|---|---|---|---|
| Move to Completed / Blocked / Closed | Yes | No | No |
| Approve team members | Yes | No | No |
| Add / remove team members | Yes | No | No |
| Update status (other) | Yes | Yes | Yes |
| Assign issues | Yes | Yes | Yes |

---

## Tech Stack

| | |
|---|---|
| Framework | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Routing | React Router v7 |
| Drag & Drop | @hello-pangea/dnd |
| Icons | lucide-react |
| API client | Fetch (`src/services/api.js`) |

---

## Tailwind v4 Notes

This project uses Tailwind CSS v4. Key differences from v3:

- Gradient utilities: `bg-linear-to-r` / `bg-linear-to-br` (not `bg-gradient-to-*`)
- Spacing: canonical values like `min-w-48`, `max-w-360` instead of arbitrary `[12rem]`, `[90rem]`
- Config in `vite.config.js` via `@tailwindcss/vite` plugin — no `tailwind.config.js` needed

```js
// vite.config.js
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({ plugins: [react(), tailwindcss()] })
```

```css
/* src/index.css */
@import "tailwindcss";
```
